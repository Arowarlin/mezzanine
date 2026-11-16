import { Router } from 'express';
import { z } from 'zod';
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { query, queryOne, withTransaction } from '../db/pool';
import { asyncHandler } from '../lib/async-handler';
import { HttpError } from '../lib/http-error';
import { publicCode } from '../lib/codes';
import { digitsOnly } from '../lib/money';
import { publicWriteLimiter } from '../middleware/rate-limit';
import { requireAuth } from '../middleware/auth';
import { getRestaurantSettings } from './settings.service';

export const publicReservationsRouter = Router();
export const adminReservationsRouter = Router();

const RESERVATION_STATUSES = ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'] as const;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)');
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time (HH:MM)');

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function fromMinutes(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function weekdayOf(date: string): number {
  return new Date(`${date}T12:00:00`).getDay();
}

function assertRealDate(date: string): void {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) throw HttpError.badRequest('Invalid date');
}

type SlotUsageRow = { reservation_time: string; used: number } & RowDataPacket;

type ReservationRow = {
  id: number;
  code: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  notes: string | null;
  status: string;
  is_demo: number;
  created_at: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
} & RowDataPacket;

function mapReservation(row: ReservationRow) {
  return {
    id: row.id,
    code: row.code,
    date: row.reservation_date,
    time: row.reservation_time.slice(0, 5),
    partySize: row.party_size,
    notes: row.notes,
    status: row.status,
    isDemo: row.is_demo === 1,
    createdAt: row.created_at,
    customer: {
      id: row.customer_id,
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email,
    },
  };
}

publicReservationsRouter.get(
  '/slots',
  asyncHandler(async (req, res) => {
    const date = dateSchema.parse(req.query.date);
    assertRealDate(date);
    const settings = await getRestaurantSettings();

    if (date < localToday()) throw HttpError.badRequest('Reservations cannot be made for a past date');
    if (settings.closedDays.includes(weekdayOf(date))) {
      res.json({ date, closed: true, slots: [] });
      return;
    }

    const usage = await query<SlotUsageRow>(
      `SELECT reservation_time, COALESCE(SUM(party_size), 0) AS used
       FROM reservations
       WHERE reservation_date = ? AND status IN ('pending', 'confirmed', 'seated')
       GROUP BY reservation_time`,
      [date],
    );
    const usedByTime = new Map(usage.map((row) => [row.reservation_time.slice(0, 5), Number(row.used)]));

    const open = toMinutes(settings.openTime);
    const close = toMinutes(settings.closeTime);
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const isToday = date === localToday();

    const slots: Array<{ time: string; remaining: number }> = [];
    for (let minute = open; minute + settings.slotMinutes <= close; minute += settings.slotMinutes) {
      const time = fromMinutes(minute);
      if (isToday && minute <= nowMinutes + 30) continue;
      const used = usedByTime.get(time) ?? 0;
      const remaining = Math.max(0, settings.seatsPerSlot - used);
      slots.push({ time, remaining });
    }

    res.json({ date, closed: false, slots });
  }),
);

const createReservationSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, 'Name is required').max(120),
    phone: z.string().trim().min(7, 'Phone is required').max(30),
    email: z.union([z.string().trim().email('Invalid email'), z.literal('')]).optional(),
  }),
  date: dateSchema,
  time: timeSchema,
  partySize: z.coerce.number().int().min(1, 'Minimum one guest').max(20, 'Maximum 20 guests'),
  notes: z.string().trim().max(500).optional(),
});

async function upsertCustomer(
  connection: PoolConnection,
  name: string,
  phone: string,
  email?: string,
): Promise<number> {
  const normalizedPhone = digitsOnly(phone);
  await connection.query(
    `INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), email = COALESCE(VALUES(email), email)`,
    [name, normalizedPhone, email && email.length > 0 ? email : null],
  );
  const [rows] = await connection.query<Array<{ id: number } & RowDataPacket>>(
    'SELECT id FROM customers WHERE phone = ? LIMIT 1',
    [normalizedPhone],
  );
  const row = rows[0];
  if (!row) throw new HttpError(500, 'Could not register the customer');
  return row.id;
}

publicReservationsRouter.post(
  '/',
  publicWriteLimiter,
  asyncHandler(async (req, res) => {
    const data = createReservationSchema.parse(req.body);
    assertRealDate(data.date);
    const settings = await getRestaurantSettings();

    if (data.date < localToday()) throw HttpError.badRequest('Reservations cannot be made for a past date');
    if (settings.closedDays.includes(weekdayOf(data.date))) {
      throw HttpError.badRequest('The restaurant is closed on that date');
    }

    const open = toMinutes(settings.openTime);
    const close = toMinutes(settings.closeTime);
    const slot = toMinutes(data.time);
    if (slot < open || slot + settings.slotMinutes > close) {
      throw HttpError.badRequest(`Reservation hours are ${settings.openTime} a ${settings.closeTime}`);
    }
    if ((slot - open) % settings.slotMinutes !== 0) {
      throw HttpError.badRequest('Choose an available time slot');
    }
    if (data.date === localToday()) {
      const now = new Date();
      if (slot <= now.getHours() * 60 + now.getMinutes() + 30) {
        throw HttpError.badRequest('Choose a time at least 30 minutes from now');
      }
    }

    const result = await withTransaction(async (connection) => {
      const [usedRows] = await connection.query<Array<{ party_size: number } & RowDataPacket>>(
        `SELECT party_size FROM reservations
         WHERE reservation_date = ? AND reservation_time = ? AND status IN ('pending', 'confirmed', 'seated')
         FOR UPDATE`,
        [data.date, `${data.time}:00`],
      );
      const usedSeats = usedRows.reduce((sum, row) => sum + row.party_size, 0);
      if (usedSeats + data.partySize > settings.seatsPerSlot) {
        throw HttpError.conflict('That time slot no longer has enough seats. Choose another time.');
      }

      const customerId = await upsertCustomer(connection, data.customer.name, data.customer.phone, data.customer.email);

      let reservationId = 0;
      let code = '';
      for (let attempt = 0; attempt < 6 && reservationId === 0; attempt += 1) {
        const candidate = publicCode('RS');
        try {
          const [inserted] = await connection.query<ResultSetHeader>(
            `INSERT INTO reservations
               (code, customer_id, reservation_date, reservation_time, party_size, notes, status, is_demo)
             VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [candidate, customerId, data.date, `${data.time}:00`, data.partySize, data.notes ?? null, settings.demoMode ? 1 : 0],
          );
          reservationId = inserted.insertId;
          code = candidate;
        } catch (error) {
          const duplicate =
            typeof error === 'object' && error !== null && (error as { code?: string }).code === 'ER_DUP_ENTRY';
          if (!duplicate) throw error;
        }
      }
      if (reservationId === 0) throw new HttpError(500, 'Could not generate the reservation code');

      return { reservationId, code };
    });

    res.status(201).json({
      reservation: {
        id: result.reservationId,
        code: result.code,
        date: data.date,
        time: data.time,
        partySize: data.partySize,
      },
    });
  }),
);

adminReservationsRouter.use(requireAuth);

const listQuerySchema = z.object({
  date: dateSchema.optional(),
  status: z.enum(RESERVATION_STATUSES).optional(),
  q: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

adminReservationsRouter.get(
  '/reservations',
  asyncHandler(async (req, res) => {
    const filters = listQuerySchema.parse(req.query);
    const where: string[] = [];
    const params: unknown[] = [];

    if (filters.date) {
      where.push('r.reservation_date = ?');
      params.push(filters.date);
    }
    if (filters.status) {
      where.push('r.status = ?');
      params.push(filters.status);
    }
    if (filters.q) {
      where.push('(r.code LIKE ? OR c.name LIKE ? OR c.phone LIKE ?)');
      const term = `%${filters.q.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
      params.push(term, term, term);
    }
    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const rows = await query<ReservationRow>(
      `SELECT r.id, r.code, r.reservation_date, r.reservation_time, r.party_size, r.notes,
              r.status, r.is_demo, r.created_at, r.customer_id,
              c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
       FROM reservations r
       JOIN customers c ON c.id = r.customer_id
       ${whereSql}
       ORDER BY r.reservation_date DESC, r.reservation_time DESC, r.id DESC
       LIMIT ? OFFSET ?`,
      [...params, filters.limit, filters.offset],
    );

    const totalRow = await queryOne<{ total: number } & RowDataPacket>(
      `SELECT COUNT(*) AS total FROM reservations r JOIN customers c ON c.id = r.customer_id ${whereSql}`,
      params,
    );

    res.json({ reservations: rows.map(mapReservation), total: Number(totalRow?.total ?? 0) });
  }),
);

const statusSchema = z.object({ status: z.enum(RESERVATION_STATUSES) });

adminReservationsRouter.patch(
  '/reservations/:id/status',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Identificador inválido');
    const { status } = statusSchema.parse(req.body);

    const existing = await queryOne<{ id: number } & RowDataPacket>('SELECT id FROM reservations WHERE id = ?', [id]);
    if (!existing) throw HttpError.notFound('Reserva no encontrada');

    await query('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
    res.json({ ok: true, id, status });
  }),
);
