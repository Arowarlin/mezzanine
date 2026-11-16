import { Router } from 'express';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, query, queryOne } from '../db/pool';
import { asyncHandler } from '../lib/async-handler';
import { HttpError } from '../lib/http-error';
import { slugify } from '../lib/slug';
import { requireAuth } from '../middleware/auth';

export const adminCatalogRouter = Router();
adminCatalogRouter.use(requireAuth);

// Acepta URLs absolutas o rutas del propio sitio (p. ej. /menu/ceviche.svg, /uploads/foto.jpg).
const imageUrlSchema = z
  .union([
    z.string().trim().url('URL de imagen inválida'),
    z.string().trim().regex(/^\/(?!\/)[\w\-./]+$/, 'URL de imagen inválida'),
    z.literal(''),
  ])
  .optional();

const categorySchema = z.object({
  name: z.string().trim().min(2, 'El nombre es obligatorio').max(120),
  kind: z.enum(['food', 'drink']).optional().default('food'),
  description: z.string().trim().max(1000).optional().default(''),
  imageUrl: imageUrlSchema,
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const MENU_TYPES = ['lunch', 'dinner', 'cocktails', 'beer', 'wine'] as const;

const productSchema = z.object({
  categoryId: z.coerce.number().int().positive('Selecciona una categoría'),
  name: z.string().trim().min(2, 'El nombre es obligatorio').max(160),
  description: z.string().trim().max(2000).optional().default(''),
  ingredients: z.string().trim().max(1000).optional().default(''),
  origin: z.string().trim().max(160).optional().default(''),
  priceCents: z.coerce.number().int().min(0, 'El precio no puede ser negativo').max(100_000_000),
  menuType: z.union([z.enum(MENU_TYPES), z.literal('')]).nullable().optional(),
  imageUrl: imageUrlSchema,
  isFeatured: z.boolean().optional().default(false),
  isAvailable: z.boolean().optional().default(true),
  isDemo: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
});

function menuTypeValue(value: string | null | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

async function uniqueSlug(table: 'categories' | 'products', base: string, ignoreId?: number): Promise<string> {
  const root = slugify(base) || 'item';
  let candidate = root;
  for (let suffix = 2; suffix < 200; suffix += 1) {
    const row = await queryOne<{ id: number } & RowDataPacket>(
      `SELECT id FROM ${table} WHERE slug = ?${ignoreId ? ' AND id <> ?' : ''} LIMIT 1`,
      ignoreId ? [candidate, ignoreId] : [candidate],
    );
    if (!row) return candidate;
    candidate = `${root}-${suffix}`.slice(0, 140);
  }
  throw new HttpError(500, 'No se pudo generar un identificador único');
}

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  kind: 'food' | 'drink';
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: number;
  product_count?: number;
} & RowDataPacket;

type ProductRow = {
  id: number;
  category_id: number;
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
  menu_type: string | null;
  sort_order: number;
  category_name: string;
} & RowDataPacket;

const mapCategory = (row: CategoryRow) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  kind: row.kind,
  description: row.description,
  imageUrl: row.image_url,
  sortOrder: row.sort_order,
  isActive: row.is_active === 1,
  productCount: row.product_count === undefined ? undefined : Number(row.product_count),
});

const mapProduct = (row: ProductRow) => ({
  id: row.id,
  categoryId: row.category_id,
  categoryName: row.category_name,
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
  sortOrder: row.sort_order,
});

adminCatalogRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const rows = await query<CategoryRow>(
      `SELECT c.id, c.name, c.slug, c.kind, c.description, c.image_url, c.sort_order, c.is_active,
              (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
       FROM categories c ORDER BY c.sort_order, c.name`,
    );
    res.json({ categories: rows.map(mapCategory) });
  }),
);

adminCatalogRouter.post(
  '/categories',
  asyncHandler(async (req, res) => {
    const data = categorySchema.parse(req.body);
    const slug = await uniqueSlug('categories', data.name);
    const result = await execute(
      `INSERT INTO categories (name, slug, kind, description, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.name, slug, data.kind, data.description || null, data.imageUrl || null, data.sortOrder, data.isActive ? 1 : 0],
    );
    const row = await queryOne<CategoryRow>(
      `SELECT id, name, slug, kind, description, image_url, sort_order, is_active FROM categories WHERE id = ?`,
      [result.insertId],
    );
    res.status(201).json({ category: mapCategory(row!) });
  }),
);

adminCatalogRouter.patch(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Identificador inválido');
    const data = categorySchema.partial().parse(req.body);

    const existing = await queryOne<CategoryRow>('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) throw HttpError.notFound('Categoría no encontrada');

    const fields: string[] = [];
    const params: unknown[] = [];
    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
      if (data.name !== existing.name) {
        fields.push('slug = ?');
        params.push(await uniqueSlug('categories', data.name, id));
      }
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description || null);
    }
    if (data.kind !== undefined) {
      fields.push('kind = ?');
      params.push(data.kind);
    }
    if (data.imageUrl !== undefined) {
      fields.push('image_url = ?');
      params.push(data.imageUrl || null);
    }
    if (data.sortOrder !== undefined) {
      fields.push('sort_order = ?');
      params.push(data.sortOrder);
    }
    if (data.isActive !== undefined) {
      fields.push('is_active = ?');
      params.push(data.isActive ? 1 : 0);
    }
    if (fields.length === 0) throw HttpError.badRequest('No hay campos que actualizar');

    await execute(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
    const row = await queryOne<CategoryRow>('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({ category: mapCategory(row!) });
  }),
);

adminCatalogRouter.delete(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Identificador inválido');

    const existing = await queryOne<{ id: number } & RowDataPacket>('SELECT id FROM categories WHERE id = ?', [id]);
    if (!existing) throw HttpError.notFound('Categoría no encontrada');

    const products = await queryOne<{ total: number } & RowDataPacket>(
      'SELECT COUNT(*) AS total FROM products WHERE category_id = ?',
      [id],
    );
    if (Number(products?.total ?? 0) > 0) {
      throw HttpError.conflict('No se puede borrar una categoría con productos. Muévelos o bórralos primero.');
    }

    await execute('DELETE FROM categories WHERE id = ?', [id]);
    res.status(204).end();
  }),
);

adminCatalogRouter.get(
  '/products',
  asyncHandler(async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const where: string[] = [];
    const params: unknown[] = [];
    if (q) {
      where.push('(p.name LIKE ? OR c.name LIKE ?)');
      const term = `%${q.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
      params.push(term, term);
    }
    const rows = await query<ProductRow>(
      `SELECT p.id, p.category_id, p.name, p.slug, p.description, p.ingredients, p.origin,
              p.price_cents, p.image_url, p.is_featured, p.is_available, p.is_demo, p.menu_type,
              p.sort_order, c.name AS category_name
       FROM products p JOIN categories c ON c.id = p.category_id
       ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY c.sort_order, p.sort_order, p.name`,
      params,
    );
    res.json({ products: rows.map(mapProduct) });
  }),
);

adminCatalogRouter.post(
  '/products',
  asyncHandler(async (req, res) => {
    const data = productSchema.parse(req.body);
    const category = await queryOne<{ id: number } & RowDataPacket>('SELECT id FROM categories WHERE id = ?', [
      data.categoryId,
    ]);
    if (!category) throw HttpError.badRequest('La categoría seleccionada no existe');

    const slug = await uniqueSlug('products', data.name);
    const result = await execute(
      `INSERT INTO products
         (category_id, name, slug, description, ingredients, origin, price_cents, menu_type,
          image_url, is_featured, is_available, is_demo, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.categoryId,
        data.name,
        slug,
        data.description || null,
        data.ingredients || null,
        data.origin || null,
        data.priceCents,
        menuTypeValue(data.menuType),
        data.imageUrl || null,
        data.isFeatured ? 1 : 0,
        data.isAvailable ? 1 : 0,
        data.isDemo ? 1 : 0,
        data.sortOrder,
      ],
    );
    const row = await queryOne<ProductRow>(
      `SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
      [result.insertId],
    );
    res.status(201).json({ product: mapProduct(row!) });
  }),
);

adminCatalogRouter.patch(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Identificador inválido');
    const data = productSchema.partial().parse(req.body);

    const existing = await queryOne<ProductRow>(
      `SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
      [id],
    );
    if (!existing) throw HttpError.notFound('Producto no encontrado');

    const fields: string[] = [];
    const params: unknown[] = [];

    if (data.categoryId !== undefined) {
      const category = await queryOne<{ id: number } & RowDataPacket>('SELECT id FROM categories WHERE id = ?', [
        data.categoryId,
      ]);
      if (!category) throw HttpError.badRequest('La categoría seleccionada no existe');
      fields.push('category_id = ?');
      params.push(data.categoryId);
    }
    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
      if (data.name !== existing.name) {
        fields.push('slug = ?');
        params.push(await uniqueSlug('products', data.name, id));
      }
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description || null);
    }
    if (data.ingredients !== undefined) {
      fields.push('ingredients = ?');
      params.push(data.ingredients || null);
    }
    if (data.origin !== undefined) {
      fields.push('origin = ?');
      params.push(data.origin || null);
    }
    if (data.menuType !== undefined) {
      fields.push('menu_type = ?');
      params.push(menuTypeValue(data.menuType));
    }
    if (data.priceCents !== undefined) {
      fields.push('price_cents = ?');
      params.push(data.priceCents);
    }
    if (data.imageUrl !== undefined) {
      fields.push('image_url = ?');
      params.push(data.imageUrl || null);
    }
    if (data.isFeatured !== undefined) {
      fields.push('is_featured = ?');
      params.push(data.isFeatured ? 1 : 0);
    }
    if (data.isAvailable !== undefined) {
      fields.push('is_available = ?');
      params.push(data.isAvailable ? 1 : 0);
    }
    if (data.isDemo !== undefined) {
      fields.push('is_demo = ?');
      params.push(data.isDemo ? 1 : 0);
    }
    if (data.sortOrder !== undefined) {
      fields.push('sort_order = ?');
      params.push(data.sortOrder);
    }
    if (fields.length === 0) throw HttpError.badRequest('No hay campos que actualizar');

    await execute(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
    const row = await queryOne<ProductRow>(
      `SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
      [id],
    );
    res.json({ product: mapProduct(row!) });
  }),
);

adminCatalogRouter.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Identificador inválido');

    const existing = await queryOne<{ id: number } & RowDataPacket>('SELECT id FROM products WHERE id = ?', [id]);
    if (!existing) throw HttpError.notFound('Producto no encontrado');

    await execute('DELETE FROM products WHERE id = ?', [id]);
    res.status(204).end();
  }),
);
