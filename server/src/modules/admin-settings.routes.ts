import { Router } from 'express';
import { z } from 'zod';
import { execute } from '../db/pool';
import { asyncHandler } from '../lib/async-handler';
import { HttpError } from '../lib/http-error';
import { restaurantDefaults } from '../config/restaurant';
import { requireAuth } from '../middleware/auth';
import { getSettingsMap } from './settings.service';

export const adminSettingsRouter = Router();
adminSettingsRouter.use(requireAuth);

const allowedKeys = new Set(Object.keys(restaurantDefaults));
const numericKeys = new Set(['delivery_fee_cents', 'min_order_cents', 'slot_minutes', 'seats_per_slot']);
const timeKeys = new Set(['open_time', 'close_time']);

adminSettingsRouter.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    res.json({ settings: await getSettingsMap() });
  }),
);

const bodySchema = z.record(z.string(), z.union([z.string(), z.number()]));

function validateEntry(key: string, raw: string | number): string {
  const value = String(raw).trim();

  if (numericKeys.has(key)) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) throw HttpError.badRequest(`${key} debe ser un entero positivo`);
    return String(parsed);
  }
  if (timeKeys.has(key)) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw HttpError.badRequest(`${key} debe tener formato HH:MM`);
    return value;
  }
  if (key === 'closed_days') {
    if (!/^\d(,\d)*$/.test(value)) throw HttpError.badRequest('closed_days debe ser una lista como "1" o "0,1"');
    const days = value.split(',').map(Number);
    if (days.some((day) => day < 0 || day > 6)) throw HttpError.badRequest('Los días deben estar entre 0 y 6');
    return value;
  }
  if (key === 'currency') {
    if (!/^[A-Z]{3}$/.test(value)) throw HttpError.badRequest('La moneda debe ser un código ISO de 3 letras');
    return value;
  }
  if (key === 'whatsapp') {
    if (!/^\d{7,15}$/.test(value)) throw HttpError.badRequest('El WhatsApp debe ser solo dígitos (7 a 15)');
    return value;
  }
  if (value.length > 1000) throw HttpError.badRequest(`${key} es demasiado largo`);
  return value;
}

adminSettingsRouter.put(
  '/settings',
  asyncHandler(async (req, res) => {
    const body = bodySchema.parse(req.body);
    const entries = Object.entries(body).filter(([key]) => allowedKeys.has(key));
    if (entries.length === 0) throw HttpError.badRequest('No hay ajustes válidos que guardar');

    for (const [key, raw] of entries) {
      const value = validateEntry(key, raw);
      await execute(
        `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value],
      );
    }

    res.json({ settings: await getSettingsMap() });
  }),
);
