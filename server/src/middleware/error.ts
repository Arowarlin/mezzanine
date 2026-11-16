import type { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http-error';
import { env } from '../config/env';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Datos inválidos',
      issues: error.issues.map((issue) => ({
        campo: issue.path.join('.') || '(raíz)',
        mensaje: issue.message,
      })),
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message, details: error.details });
    return;
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? `La imagen supera el máximo de ${env.UPLOAD_MAX_MB} MB`
        : `Error al subir el archivo: ${error.message}`;
    res.status(400).json({ error: message });
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido' });
    return;
  }

  console.error('[error no controlado]', error);
  res.status(500).json({ error: 'Error interno del servidor' });
};
