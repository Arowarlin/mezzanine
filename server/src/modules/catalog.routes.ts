import { Router } from 'express';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2/promise';
import { query } from '../db/pool';
import { asyncHandler } from '../lib/async-handler';
import { getSettingsMap } from './settings.service';

const router = Router();

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
} & RowDataPacket;

type ProductRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  is_featured: number;
  is_available: number;
  category_id: number;
  category_name: string;
  category_slug: string;
} & RowDataPacket;

const productQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.string().trim().max(140).optional(),
  featured: z.enum(['true', 'false']).optional(),
  available: z.enum(['true', 'false']).optional(),
});

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const map = await getSettingsMap();
    const publicKeys = [
      'restaurant_name',
      'tagline',
      'description',
      'phone',
      'whatsapp',
      'email',
      'address',
      'city',
      'country',
      'instagram',
      'currency',
      'delivery_fee_cents',
      'min_order_cents',
      'open_time',
      'close_time',
      'slot_minutes',
      'seats_per_slot',
      'closed_days',
    ];
    const settings = Object.fromEntries(publicKeys.map((key) => [key, map[key] ?? null]));
    res.json({ settings });
  }),
);

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const rows = await query<CategoryRow>(
      `SELECT id, name, slug, description, image_url, sort_order
       FROM categories WHERE is_active = 1 ORDER BY sort_order, name`,
    );
    res.json({
      categories: rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        imageUrl: row.image_url,
        sortOrder: row.sort_order,
      })),
    });
  }),
);

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const filters = productQuerySchema.parse(req.query);
    const where: string[] = ['p.is_available = 1', 'c.is_active = 1'];
    const params: unknown[] = [];

    if (filters.q) {
      const term = `%${escapeLike(filters.q)}%`;
      where.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(term, term);
    }
    if (filters.category) {
      where.push('c.slug = ?');
      params.push(filters.category);
    }
    if (filters.featured === 'true') where.push('p.is_featured = 1');
    if (filters.available === 'false') where.push('p.is_available = 0');

    const rows = await query<ProductRow>(
      `SELECT p.id, p.name, p.slug, p.description, p.price_cents, p.image_url,
              p.is_featured, p.is_available, p.category_id,
              c.name AS category_name, c.slug AS category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE ${where.join(' AND ')}
       ORDER BY c.sort_order, p.sort_order, p.name`,
      params,
    );

    res.json({
      products: rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        priceCents: row.price_cents,
        imageUrl: row.image_url,
        isFeatured: row.is_featured === 1,
        isAvailable: row.is_available === 1,
        categoryId: row.category_id,
        categoryName: row.category_name,
        categorySlug: row.category_slug,
      })),
    });
  }),
);

router.get(
  '/gallery',
  asyncHandler(async (_req, res) => {
    const rows = await query<{ id: number; url: string; title: string | null } & RowDataPacket>(
      'SELECT id, url, title FROM gallery_images WHERE is_active = 1 ORDER BY sort_order, id',
    );
    res.json({ images: rows });
  }),
);

export default router;
