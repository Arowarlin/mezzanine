import { Router } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import { query, queryOne } from '../db/pool';
import { asyncHandler } from '../lib/async-handler';
import { requireAuth } from '../middleware/auth';

export const adminStatsRouter = Router();
adminStatsRouter.use(requireAuth);

function localDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

adminStatsRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [today, pending, reservationsToday, customers, products, revenueRows, topProducts, upcoming, recent] =
      await Promise.all([
        queryOne<{ orders: number; revenue: number } & RowDataPacket>(
          `SELECT COUNT(*) AS orders, COALESCE(SUM(total_cents), 0) AS revenue
           FROM orders WHERE DATE(created_at) = CURDATE() AND status <> 'cancelled'`,
        ),
        queryOne<{ total: number } & RowDataPacket>(
          `SELECT COUNT(*) AS total FROM orders
           WHERE status IN ('pending', 'confirmed', 'preparing', 'ready')`,
        ),
        queryOne<{ total: number; guests: number } & RowDataPacket>(
          `SELECT COUNT(*) AS total, COALESCE(SUM(party_size), 0) AS guests
           FROM reservations WHERE reservation_date = CURDATE() AND status IN ('pending', 'confirmed', 'seated')`,
        ),
        queryOne<{ total: number } & RowDataPacket>('SELECT COUNT(*) AS total FROM customers'),
        queryOne<{ total: number; available: number } & RowDataPacket>(
          'SELECT COUNT(*) AS total, COALESCE(SUM(is_available), 0) AS available FROM products',
        ),
        query<{ day: string; revenue: number; orders: number } & RowDataPacket>(
          `SELECT DATE(created_at) AS day, COALESCE(SUM(total_cents), 0) AS revenue, COUNT(*) AS orders
           FROM orders
           WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND status <> 'cancelled'
           GROUP BY DATE(created_at)`,
        ),
        query<{ product_name: string; quantity: number; revenue: number } & RowDataPacket>(
          `SELECT oi.product_name, SUM(oi.quantity) AS quantity, SUM(oi.line_total_cents) AS revenue
           FROM order_items oi JOIN orders o ON o.id = oi.order_id
           WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND o.status <> 'cancelled'
           GROUP BY oi.product_name
           ORDER BY quantity DESC
           LIMIT 5`,
        ),
        query<
          {
            id: number;
            code: string;
            reservation_date: string;
            reservation_time: string;
            party_size: number;
            status: string;
            customer_name: string;
          } & RowDataPacket
        >(
          `SELECT r.id, r.code, r.reservation_date, r.reservation_time, r.party_size, r.status,
                  c.name AS customer_name
           FROM reservations r JOIN customers c ON c.id = r.customer_id
           WHERE r.reservation_date >= CURDATE() AND r.status IN ('pending', 'confirmed')
           ORDER BY r.reservation_date, r.reservation_time
           LIMIT 5`,
        ),
        query<
          {
            id: number;
            code: string;
            type: string;
            status: string;
            total_cents: number;
            created_at: string;
            customer_name: string;
          } & RowDataPacket
        >(
          `SELECT o.id, o.code, o.type, o.status, o.total_cents, o.created_at, c.name AS customer_name
           FROM orders o JOIN customers c ON c.id = o.customer_id
           ORDER BY o.created_at DESC, o.id DESC
           LIMIT 5`,
        ),
      ]);

    const revenueByDay = new Map(revenueRows.map((row) => [row.day, row]));
    const revenueSeries = Array.from({ length: 7 }, (_, index) => {
      const day = localDate(index - 6);
      const row = revenueByDay.get(day);
      return { day, revenueCents: Number(row?.revenue ?? 0), orders: Number(row?.orders ?? 0) };
    });

    res.json({
      today: {
        orders: Number(today?.orders ?? 0),
        revenueCents: Number(today?.revenue ?? 0),
      },
      pendingOrders: Number(pending?.total ?? 0),
      todayReservations: {
        total: Number(reservationsToday?.total ?? 0),
        guests: Number(reservationsToday?.guests ?? 0),
      },
      customers: Number(customers?.total ?? 0),
      products: {
        total: Number(products?.total ?? 0),
        available: Number(products?.available ?? 0),
      },
      revenueSeries,
      topProducts: topProducts.map((row) => ({
        name: row.product_name,
        quantity: Number(row.quantity),
        revenueCents: Number(row.revenue),
      })),
      upcomingReservations: upcoming.map((row) => ({
        id: row.id,
        code: row.code,
        date: row.reservation_date,
        time: row.reservation_time.slice(0, 5),
        partySize: row.party_size,
        status: row.status,
        customerName: row.customer_name,
      })),
      recentOrders: recent.map((row) => ({
        id: row.id,
        code: row.code,
        type: row.type,
        status: row.status,
        totalCents: row.total_cents,
        createdAt: row.created_at,
        customerName: row.customer_name,
      })),
    });
  }),
);
