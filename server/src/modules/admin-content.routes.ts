import { Router } from 'express';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, query, queryOne } from '../db/pool';
import { asyncHandler } from '../lib/async-handler';
import { HttpError } from '../lib/http-error';
import { requireAuth } from '../middleware/auth';

export const adminContentRouter = Router();
adminContentRouter.use(requireAuth);

// Acepta URLs absolutas o rutas del propio sitio (p. ej. /photos/venue-entrance.jpg).
const imageUrlSchema = z.union([
  z.string().trim().url('URL de imagen inválida'),
  z.string().trim().regex(/^\/(?!\/)[\w\-./]+$/, 'URL de imagen inválida'),
]);

const gallerySchema = z.object({
  url: imageUrlSchema,
  title: z.string().trim().max(160).optional().default(''),
  category: z.string().trim().max(40).optional().default('rooftop'),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'seasonal'] as const;

const careerSchema = z.object({
  title: z.string().trim().min(2, 'El puesto es obligatorio').max(160),
  description: z.string().trim().max(2000).optional().default(''),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional().default('full_time'),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

type GalleryRow = {
  id: number;
  url: string;
  title: string | null;
  category: string;
  sort_order: number;
  is_active: number;
} & RowDataPacket;

type CareerRow = {
  id: number;
  title: string;
  description: string | null;
  employment_type: string;
  sort_order: number;
  is_active: number;
} & RowDataPacket;

const mapGallery = (row: GalleryRow) => ({
  id: row.id,
  url: row.url,
  title: row.title,
  category: row.category,
  sortOrder: row.sort_order,
  isActive: row.is_active === 1,
});

const mapCareer = (row: CareerRow) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  employmentType: row.employment_type,
  sortOrder: row.sort_order,
  isActive: row.is_active === 1,
});

adminContentRouter.get(
  '/gallery',
  asyncHandler(async (_req, res) => {
    const rows = await query<GalleryRow>(
      'SELECT id, url, title, category, sort_order, is_active FROM gallery_images ORDER BY sort_order, id',
    );
    res.json({ images: rows.map(mapGallery) });
  }),
);

adminContentRouter.post(
  '/gallery',
  asyncHandler(async (req, res) => {
    const data = gallerySchema.parse(req.body);
    const result = await execute(
      `INSERT INTO gallery_images (url, title, category, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [data.url, data.title || null, data.category || 'rooftop', data.sortOrder, data.isActive ? 1 : 0],
    );
    const row = await queryOne<GalleryRow>('SELECT * FROM gallery_images WHERE id = ?', [result.insertId]);
    res.status(201).json({ image: mapGallery(row!) });
  }),
);

adminContentRouter.patch(
  '/gallery/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Identificador inválido');
    const data = gallerySchema.partial().parse(req.body);

    const existing = await queryOne<GalleryRow>('SELECT * FROM gallery_images WHERE id = ?', [id]);
    if (!existing) throw HttpError.notFound('Imagen no encontrada');

    const fields: string[] = [];
    const params: unknown[] = [];
    if (data.url !== undefined) {
      fields.push('url = ?');
      params.push(data.url);
    }
    if (data.title !== undefined) {
      fields.push('title = ?');
      params.push(data.title || null);
    }
    if (data.category !== undefined) {
      fields.push('category = ?');
      params.push(data.category || 'rooftop');
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

    await execute(`UPDATE gallery_images SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
    const row = await queryOne<GalleryRow>('SELECT * FROM gallery_images WHERE id = ?', [id]);
    res.json({ image: mapGallery(row!) });
  }),
);

adminContentRouter.delete(
  '/gallery/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Identificador inválido');

    const existing = await queryOne<{ id: number } & RowDataPacket>('SELECT id FROM gallery_images WHERE id = ?', [id]);
    if (!existing) throw HttpError.notFound('Imagen no encontrada');

    await execute('DELETE FROM gallery_images WHERE id = ?', [id]);
    res.status(204).end();
  }),
);

adminContentRouter.get(
  '/careers',
  asyncHandler(async (_req, res) => {
    const rows = await query<CareerRow>(
      'SELECT id, title, description, employment_type, sort_order, is_active FROM career_openings ORDER BY sort_order, id',
    );
    res.json({ openings: rows.map(mapCareer) });
  }),
);

adminContentRouter.post(
  '/careers',
  asyncHandler(async (req, res) => {
    const data = careerSchema.parse(req.body);
    const result = await execute(
      `INSERT INTO career_openings (title, description, employment_type, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [data.title, data.description || null, data.employmentType, data.sortOrder, data.isActive ? 1 : 0],
    );
    const row = await queryOne<CareerRow>('SELECT * FROM career_openings WHERE id = ?', [result.insertId]);
    res.status(201).json({ opening: mapCareer(row!) });
  }),
);

adminContentRouter.patch(
  '/careers/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Identificador inválido');
    const data = careerSchema.partial().parse(req.body);

    const existing = await queryOne<CareerRow>('SELECT * FROM career_openings WHERE id = ?', [id]);
    if (!existing) throw HttpError.notFound('Puesto no encontrado');

    const fields: string[] = [];
    const params: unknown[] = [];
    if (data.title !== undefined) {
      fields.push('title = ?');
      params.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description || null);
    }
    if (data.employmentType !== undefined) {
      fields.push('employment_type = ?');
      params.push(data.employmentType);
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

    await execute(`UPDATE career_openings SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
    const row = await queryOne<CareerRow>('SELECT * FROM career_openings WHERE id = ?', [id]);
    res.json({ opening: mapCareer(row!) });
  }),
);

adminContentRouter.delete(
  '/careers/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Identificador inválido');

    const existing = await queryOne<{ id: number } & RowDataPacket>('SELECT id FROM career_openings WHERE id = ?', [id]);
    if (!existing) throw HttpError.notFound('Puesto no encontrado');

    await execute('DELETE FROM career_openings WHERE id = ?', [id]);
    res.status(204).end();
  }),
);
