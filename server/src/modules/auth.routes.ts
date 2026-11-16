import { Router } from 'express';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2/promise';
import { env } from '../config/env';
import { queryOne } from '../db/pool';
import { asyncHandler } from '../lib/async-handler';
import { HttpError } from '../lib/http-error';
import { requireAuth, SESSION_COOKIE } from '../middleware/auth';
import { loginLimiter } from '../middleware/rate-limit';

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type UserRow = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'staff';
  is_active: number;
} & RowDataPacket;

/** Hash de relleno para que un correo inexistente tarde lo mismo que uno real. */
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.5r5f5T5c5T5c5T5c5T5c5T5c5T5c5T5';

function cookieMaxAge(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiresIn.trim());
  if (!match) return 8 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const factor = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  return value * factor;
}

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await queryOne<UserRow>(
      'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1',
      [email],
    );

    const validPassword = await compare(password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !validPassword || user.is_active !== 1) {
      throw HttpError.unauthorized('Correo o contraseña incorrectos');
    }

    const token = jwt.sign({ sub: String(user.id), role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.cookieSecure,
      maxAge: cookieMaxAge(env.JWT_EXPIRES_IN),
      path: '/',
    });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }),
);

router.post('/logout', (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.status(204).end();
});

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  }),
);

export default router;
