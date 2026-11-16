import rateLimit from 'express-rate-limit';

const message = { error: 'Demasiadas solicitudes. Inténtalo de nuevo en unos minutos.' };

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message,
});

export const publicWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 25,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message,
});
