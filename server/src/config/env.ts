import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().min(1).default('http://localhost:5173'),

  DB_HOST: z.string().min(1).default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3307),
  DB_NAME: z.string().min(1).default('restaurante_web'),
  DB_USER: z.string().min(1).default('restaurante'),
  DB_PASSWORD: z.string().min(1),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false'),

  UPLOAD_MAX_MB: z.coerce.number().positive().default(5),

  ADMIN_NAME: z.string().default('Administrador'),
  ADMIN_EMAIL: z.string().email().default('admin@mezzanine.local'),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD debe tener al menos 8 caracteres'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const detail = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
  console.error(`\nConfiguracion invalida en server/.env:\n${detail}\n`);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
  cookieSecure: parsed.data.COOKIE_SECURE === 'true',
};
