import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { asyncHandler } from '../lib/async-handler';
import { HttpError } from '../lib/http-error';
import { queryOne } from '../db/pool';
import type { AuthUser } from '../types/express';

export const SESSION_COOKIE = 'cv_session';

type SessionPayload = { sub: string; role: string };

export const requireAuth: RequestHandler = asyncHandler(async (req, _res, next) => {
  const token = (req.cookies as Record<string, string> | undefined)?.[SESSION_COOKIE];
  if (!token) throw HttpError.unauthorized('Sesión requerida');

  let payload: SessionPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as SessionPayload;
  } catch {
    throw HttpError.unauthorized('Sesión inválida o expirada');
  }

  const user = await queryOne<AuthUser & { is_active: number } & import('mysql2/promise').RowDataPacket>(
    'SELECT id, name, email, role, is_active FROM users WHERE id = ? LIMIT 1',
    [Number(payload.sub)],
  );
  if (!user || user.is_active !== 1) throw HttpError.unauthorized('Usuario inactivo');

  req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  next();
});

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) throw HttpError.unauthorized('Sesión requerida');
  if (req.user.role !== 'admin') throw HttpError.forbidden('Se requiere rol de administrador');
  next();
};
