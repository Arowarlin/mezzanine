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
  kind: 'food' | 'drink';
  description: string | null;
  image_url: string | null;
  sort_order: number;
} & RowDataPacket;

type ProductRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  origin: string | null;
  price_cents: number;
  image_url: string | null;
  is_featured: number;
  is_available: number;
  is_demo: number;
  menu_type: 'lunch' | 'dinner' | 'cocktails' | 'beer' | 'wine' | null;
  category_id: number;
  category_name: string;
  category_slug: string;
  category_kind: 'food' | 'drink';
} & RowDataPacket;

const productQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.string().trim().max(140).optional(),
  menu: z.enum(['lunch', 'dinner', 'cocktails', 'beer', 'wine']).optional(),
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
      'facebook',
      'official_website',
      'currency',
      'delivery_fee_cents',
      'min_order_cents',
      'open_time',
      'close_time',
      'slot_minutes',
      'seats_per_slot',
      'closed_days',
      'hours_note',
      'demo_mode',
      'demo_notice',
      'hero_title',
      'hero_subtitle',
      'about_intro',
      'careers_intro',
    ];
    const settings = Object.fromEntries(publicKeys.map((key) => [key, map[key] ?? null]));
    res.json({ settings });
  }),
);

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const rows = await query<CategoryRow>(
      `SELECT id, name, slug, kind, description, image_url, sort_order
       FROM categories WHERE is_active = 1 ORDER BY sort_order, name`,
    );
    res.json({
      categories: rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        kind: row.kind,
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
      where.push('(p.name LIKE ? OR p.description LIKE ? OR p.ingredients LIKE ?)');
      params.push(term, term, term);
    }
    if (filters.category) {
      where.push('c.slug = ?');
      params.push(filters.category);
    }
    if (filters.menu) {
      where.push('p.menu_type = ?');
      params.push(filters.menu);
    }
    if (filters.featured === 'true') where.push('p.is_featured = 1');
    if (filters.available === 'false') where.push('p.is_available = 0');

    const rows = await query<ProductRow>(
      `SELECT p.id, p.name, p.slug, p.description, p.ingredients, p.origin, p.price_cents, p.image_url,
              p.is_featured, p.is_available, p.is_demo, p.menu_type, p.category_id,
              c.name AS category_name, c.slug AS category_slug, c.kind AS category_kind
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
        ingredients: row.ingredients,
        origin: row.origin,
        priceCents: row.price_cents,
        imageUrl: row.image_url,
        isFeatured: row.is_featured === 1,
        isAvailable: row.is_available === 1,
        isDemo: row.is_demo === 1,
        menuType: row.menu_type,
        categoryId: row.category_id,
        categoryName: row.category_name,
        categorySlug: row.category_slug,
        categoryKind: row.category_kind,
      })),
    });
  }),
);

router.get(
  '/gallery',
  asyncHandler(async (req, res) => {
    const category = typeof req.query.category === 'string' ? req.query.category.trim().slice(0, 40) : '';
    const params: unknown[] = [];
    let where = 'is_active = 1';
    if (category) {
      where += ' AND category = ?';
      params.push(category);
    }
    const rows = await query<{ id: number; url: string; title: string | null; category: string } & RowDataPacket>(
      `SELECT id, url, title, category FROM gallery_images WHERE ${where} ORDER BY sort_order, id`,
      params,
    );
    res.json({ images: rows });
  }),
);

router.get(
  '/careers',
  asyncHandler(async (_req, res) => {
    const rows = await query<
      { id: number; title: string; description: string | null; employment_type: string } & RowDataPacket
    >(
      `SELECT id, title, description, employment_type
       FROM career_openings WHERE is_active = 1 ORDER BY sort_order, id`,
    );
    res.json({
      openings: rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        employmentType: row.employment_type,
      })),
    });
  }),
);

export default router;
