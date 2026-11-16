import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler';
import { HttpError } from '../lib/http-error';
import { imageUpload, uploadedFileNamePattern, uploadsDir } from '../middleware/upload';
import { requireAuth } from '../middleware/auth';

export const adminUploadsRouter = Router();
adminUploadsRouter.use(requireAuth);

adminUploadsRouter.post(
  '/',
  imageUpload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw HttpError.badRequest('Adjunta una imagen en el campo "image"');
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  }),
);

adminUploadsRouter.delete(
  '/:name',
  asyncHandler(async (req, res) => {
    const name = String(req.params.name ?? '');
    if (!uploadedFileNamePattern.test(name)) throw HttpError.badRequest('Nombre de archivo inválido');

    const filePath = path.join(uploadsDir, name);
    if (!filePath.startsWith(uploadsDir)) throw HttpError.badRequest('Ruta inválida');

    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    res.status(204).end();
  }),
);
