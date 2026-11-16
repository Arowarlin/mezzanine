import { Router } from 'express';
import { z } from 'zod';
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { query, queryOne, withTransaction } from '../db/pool';
import { asyncHandler } from '../lib/async-handler';
import { HttpError } from '../lib/http-error';
import { publicCode } from '../lib/codes';
import { digitsOnly, formatMoney } from '../lib/money';
import { publicWriteLimiter } from '../middleware/rate-limit';
import { requireAuth } from '../middleware/auth';
import { getRestaurantSettings } from './settings.service';

export const publicOrdersRouter = Router();
export const adminOrdersRouter = Router();

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as const;

const orderSchema = z
  .object({
    customer: z.object({
      name: z.string().trim().min(2, 'Name is required').max(120),
      phone: z.string().trim().min(7, 'Phone is required').max(30),
      email: z.union([z.string().trim().email('Invalid email'), z.literal('')]).optional(),
    }),
    type: z.enum(['delivery', 'pickup']),
    address: z.string().trim().max(300).optional(),
    notes: z.string().trim().max(1000).optional(),
    items: z
      .array(
        z.object({
          productId: z.coerce.number().int().positive(),
          quantity: z.coerce.number().int().min(1).max(50),
          notes: z.string().trim().max(300).optional(),
        }),
      )
      .min(1, 'The order needs at least one item')
      .max(50),
  })
  .refine((data) => data.type !== 'delivery' || (data.address && data.address.length >= 8), {
    message: 'Address is required for delivery',
    path: ['address'],
  });

type ProductRow = {
  id: number;
  name: string;
  price_cents: number;
  is_available: number;
} & RowDataPacket;

type CustomerRow = { id: number } & RowDataPacket;

type OrderRow = {
  id: number;
  code: string;
  type: 'delivery' | 'pickup';
  status: string;
  is_demo: number;
  subtotal_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  address: string | null;
  notes: string | null;
  created_at: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
} & RowDataPacket;

type OrderItemRow = {
  id: number;
  product_id: number | null;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  notes: string | null;
  line_total_cents: number;
} & RowDataPacket;

function isDuplicateKey(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'ER_DUP_ENTRY';
}

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
  const [rows] = await connection.query<CustomerRow[]>('SELECT id FROM customers WHERE phone = ? LIMIT 1', [
    normalizedPhone,
  ]);
  const row = rows[0];
  if (!row) throw new HttpError(500, 'Could not register the customer');
  return row.id;
}

function mapOrder(row: OrderRow) {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    status: row.status,
    isDemo: row.is_demo === 1,
    subtotalCents: row.subtotal_cents,
    deliveryFeeCents: row.delivery_fee_cents,
    totalCents: row.total_cents,
    address: row.address,
    notes: row.notes,
    createdAt: row.created_at,
    customer: {
      id: row.customer_id,
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email,
    },
  };
}

publicOrdersRouter.post(
  '/',
  publicWriteLimiter,
  asyncHandler(async (req, res) => {
    const data = orderSchema.parse(req.body);
    const settings = await getRestaurantSettings();

    const ids = [...new Set(data.items.map((item) => item.productId))];
    const products = await query<ProductRow>(
      'SELECT id, name, price_cents, is_available FROM products WHERE id IN (?)',
      [ids],
    );
    const byId = new Map(products.map((product) => [product.id, product]));

    const missing = data.items.filter((item) => !byId.has(item.productId));
    if (missing.length > 0) {
      throw HttpError.badRequest('One of the items is no longer available', {
        productIds: missing.map((item) => item.productId),
      });
    }
    const unavailable = data.items.filter((item) => byId.get(item.productId)!.is_available !== 1);
    if (unavailable.length > 0) {
      throw HttpError.badRequest('One of the items is not available right now', {
        productIds: unavailable.map((item) => item.productId),
      });
    }
    const unpriced = data.items.filter((item) => byId.get(item.productId)!.price_cents <= 0);
    if (unpriced.length > 0) {
      throw HttpError.badRequest('Some items do not have a confirmed price yet and cannot be ordered', {
        productIds: unpriced.map((item) => item.productId),
      });
    }

    const lines = data.items.map((item) => {
      const product = byId.get(item.productId)!;
      return {
        productId: product.id,
        name: product.name,
        unitPriceCents: product.price_cents,
        quantity: item.quantity,
        notes: item.notes ?? null,
        lineTotalCents: product.price_cents * item.quantity,
      };
    });

    const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
    const deliveryFeeCents = data.type === 'delivery' ? settings.deliveryFeeCents : 0;

    if (data.type === 'delivery' && settings.minOrderCents > 0 && subtotalCents < settings.minOrderCents) {
      throw HttpError.badRequest(
        `The delivery minimum is ${formatMoney(settings.minOrderCents, settings.currency)}`,
      );
    }

    const totalCents = subtotalCents + deliveryFeeCents;

    const result = await withTransaction(async (connection) => {
      const customerId = await upsertCustomer(
        connection,
        data.customer.name,
        data.customer.phone,
        data.customer.email,
      );

      let orderId = 0;
      let code = '';
      for (let attempt = 0; attempt < 6 && orderId === 0; attempt += 1) {
        const candidate = publicCode('MZ');
        try {
          const [inserted] = await connection.query<ResultSetHeader>(
            `INSERT INTO orders
               (code, customer_id, type, is_demo, subtotal_cents, delivery_fee_cents, total_cents, address, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              candidate,
              customerId,
              data.type,
              settings.demoMode ? 1 : 0,
              subtotalCents,
              deliveryFeeCents,
              totalCents,
              data.type === 'delivery' ? (data.address ?? null) : null,
              data.notes ?? null,
            ],
          );
          orderId = inserted.insertId;
          code = candidate;
        } catch (error) {
          if (!isDuplicateKey(error)) throw error;
        }
      }
      if (orderId === 0) throw new HttpError(500, 'Could not generate the order code');

      for (const line of lines) {
        await connection.query(
          `INSERT INTO order_items
             (order_id, product_id, product_name, unit_price_cents, quantity, notes, line_total_cents)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, line.productId, line.name, line.unitPriceCents, line.quantity, line.notes, line.lineTotalCents],
        );
      }

      return { orderId, code };
    });

    const messageLines = [
      `Hello ${settings.name}, I just placed order ${result.code}.`,
      `Type: ${data.type === 'delivery' ? 'Delivery' : 'Pickup'}`,
      `Guest: ${data.customer.name}`,
      `Phone: ${digitsOnly(data.customer.phone)}`,
    ];
    if (data.type === 'delivery') messageLines.push(`Address: ${data.address}`);
    messageLines.push('', 'Order:');
    for (const line of lines) {
      messageLines.push(`• ${line.quantity} × ${line.name} — ${formatMoney(line.lineTotalCents, settings.currency)}`);
    }
    messageLines.push(
      '',
      `Subtotal: ${formatMoney(subtotalCents, settings.currency)}`,
      `Delivery: ${formatMoney(deliveryFeeCents, settings.currency)}`,
      `Total: ${formatMoney(totalCents, settings.currency)}`,
    );
    if (data.notes) messageLines.push(`Notes: ${data.notes}`);

    // En modo demo no se envía nada a nadie: no hay enlace de WhatsApp real.
    const whatsappDigits = digitsOnly(settings.whatsapp);
    const whatsappUrl =
      !settings.demoMode && whatsappDigits.length >= 7
        ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(messageLines.join('\n'))}`
        : null;

    res.status(201).json({
      order: {
        id: result.orderId,
        code: result.code,
        subtotalCents,
        deliveryFeeCents,
        totalCents,
        type: data.type,
        isDemo: settings.demoMode,
      },
      whatsappUrl,
    });
  }),
);

adminOrdersRouter.use(requireAuth);

const listQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  q: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

adminOrdersRouter.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const filters = listQuerySchema.parse(req.query);
    const where: string[] = [];
    const params: unknown[] = [];

    if (filters.status) {
      where.push('o.status = ?');
      params.push(filters.status);
    }
    if (filters.q) {
      where.push('(o.code LIKE ? OR c.name LIKE ? OR c.phone LIKE ?)');
      const term = `%${filters.q.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
      params.push(term, term, term);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await query<OrderRow>(
      `SELECT o.id, o.code, o.type, o.status, o.is_demo, o.subtotal_cents, o.delivery_fee_cents, o.total_cents,
              o.address, o.notes, o.created_at, o.customer_id,
              c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       ${whereSql}
       ORDER BY o.created_at DESC, o.id DESC
       LIMIT ? OFFSET ?`,
      [...params, filters.limit, filters.offset],
    );

    const totalRow = await queryOne<{ total: number } & RowDataPacket>(
      `SELECT COUNT(*) AS total FROM orders o JOIN customers c ON c.id = o.customer_id ${whereSql}`,
      params,
    );

    res.json({ orders: rows.map(mapOrder), total: Number(totalRow?.total ?? 0) });
  }),
);

adminOrdersRouter.get(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Identificador inválido');

    const order = await queryOne<OrderRow>(
      `SELECT o.id, o.code, o.type, o.status, o.is_demo, o.subtotal_cents, o.delivery_fee_cents, o.total_cents,
              o.address, o.notes, o.created_at, o.customer_id,
              c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
       FROM orders o JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? LIMIT 1`,
      [id],
    );
    if (!order) throw HttpError.notFound('Pedido no encontrado');

    const items = await query<OrderItemRow>(
      `SELECT id, product_id, product_name, unit_price_cents, quantity, notes, line_total_cents
       FROM order_items WHERE order_id = ? ORDER BY id`,
      [id],
    );

    res.json({
      order: mapOrder(order),
      items: items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        unitPriceCents: item.unit_price_cents,
        quantity: item.quantity,
        notes: item.notes,
        lineTotalCents: item.line_total_cents,
      })),
    });
  }),
);

const statusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

adminOrdersRouter.patch(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Identificador inválido');
    const { status } = statusSchema.parse(req.body);

    const result = await queryOne<{ id: number } & RowDataPacket>('SELECT id FROM orders WHERE id = ?', [id]);
    if (!result) throw HttpError.notFound('Pedido no encontrado');

    await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ ok: true, id, status });
  }),
);
