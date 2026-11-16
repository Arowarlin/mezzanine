import { Router } from 'express';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, query, queryOne } from '../db/pool';
import { asyncHandler } from '../lib/async-handler';
import { HttpError } from '../lib/http-error';
import { requireAuth } from '../middleware/auth';

export const adminCustomersRouter = Router();
adminCustomersRouter.use(requireAuth);

type CustomerRow = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  created_at: string;
  orders_count: number;
  reservations_count: number;
  total_spent_cents: number;
} & RowDataPacket;

const listQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const mapCustomer = (row: CustomerRow) => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: row.email,
  notes: row.notes,
  createdAt: row.created_at,
  ordersCount: Number(row.orders_count),
  reservationsCount: Number(row.reservations_count),
  totalSpentCents: Number(row.total_spent_cents),
});

adminCustomersRouter.get(
  '/customers',
  asyncHandler(async (req, res) => {
    const filters = listQuerySchema.parse(req.query);
    const where: string[] = [];
    const params: unknown[] = [];
    if (filters.q) {
      where.push('(c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)');
      const term = `%${filters.q.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
      params.push(term, term, term);
    }
    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const rows = await query<CustomerRow>(
      `SELECT c.id, c.name, c.phone, c.email, c.notes, c.created_at,
              (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS orders_count,
              (SELECT COUNT(*) FROM reservations r WHERE r.customer_id = c.id) AS reservations_count,
              (SELECT COALESCE(SUM(o.total_cents), 0) FROM orders o
                 WHERE o.customer_id = c.id AND o.status <> 'cancelled') AS total_spent_cents
       FROM customers c
       ${whereSql}
       ORDER BY c.created_at DESC, c.id DESC
       LIMIT ? OFFSET ?`,
      [...params, filters.limit, filters.offset],
    );

    const totalRow = await queryOne<{ total: number } & RowDataPacket>(
      `SELECT COUNT(*) AS total FROM customers c ${whereSql}`,
      params,
    );

    res.json({ customers: rows.map(mapCustomer), total: Number(totalRow?.total ?? 0) });
  }),
);

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.union([z.string().trim().email('Correo inválido'), z.literal('')]).optional(),
  notes: z.string().trim().max(2000).optional(),
});

adminCustomersRouter.patch(
  '/customers/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Identificador inválido');
    const data = updateSchema.parse(req.body);

    const existing = await queryOne<CustomerRow>(
      `SELECT c.id, c.name, c.phone, c.email, c.notes, c.created_at,
              0 AS orders_count, 0 AS reservations_count, 0 AS total_spent_cents
       FROM customers c WHERE c.id = ?`,
      [id],
    );
    if (!existing) throw HttpError.notFound('Cliente no encontrado');

    const fields: string[] = [];
    const params: unknown[] = [];
    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      params.push(data.email || null);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      params.push(data.notes || null);
    }
    if (fields.length === 0) throw HttpError.badRequest('No hay campos que actualizar');

    await execute(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
    const row = await queryOne<CustomerRow>(
      `SELECT c.id, c.name, c.phone, c.email, c.notes, c.created_at,
              (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS orders_count,
              (SELECT COUNT(*) FROM reservations r WHERE r.customer_id = c.id) AS reservations_count,
              (SELECT COALESCE(SUM(o.total_cents), 0) FROM orders o
                 WHERE o.customer_id = c.id AND o.status <> 'cancelled') AS total_spent_cents
       FROM customers c WHERE c.id = ?`,
      [id],
    );
    res.json({ customer: mapCustomer(row!) });
  }),
);
