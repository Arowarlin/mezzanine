import { randomUUID } from 'node:crypto';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env';
import { HttpError } from '../lib/http-error';

export const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

const allowed = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadsDir),
  filename: (_req, file, callback) => {
    const extension = allowed.get(file.mimetype) ?? '.bin';
    callback(null, `${randomUUID()}${extension}`);
  },
});

export const imageUpload = multer({
  storage,
  limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowed.has(file.mimetype)) {
      callback(HttpError.badRequest('Formato no permitido. Usa JPG, PNG, WEBP o AVIF.'));
      return;
    }
    callback(null, true);
  },
});

export const uploadedFileNamePattern = /^[0-9a-f-]{36}\.(jpg|png|webp|avif)$/i;
