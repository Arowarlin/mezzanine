import { mkdirSync } from 'node:fs';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { query } from './db/pool';
import { asyncHandler } from './lib/async-handler';
import { errorHandler, notFoundHandler } from './middleware/error';
import { uploadsDir } from './middleware/upload';
import authRouter from './modules/auth.routes';
import catalogRouter from './modules/catalog.routes';
import { adminOrdersRouter, publicOrdersRouter } from './modules/orders.routes';
import { adminReservationsRouter, publicReservationsRouter } from './modules/reservations.routes';
import { adminCatalogRouter } from './modules/admin-catalog.routes';
import { adminCustomersRouter } from './modules/admin-customers.routes';
import { adminStatsRouter } from './modules/admin-stats.routes';
import { adminSettingsRouter } from './modules/admin-settings.routes';
import { adminUploadsRouter } from './modules/admin-uploads.routes';

export function createApp() {
  mkdirSync(uploadsDir, { recursive: true });

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameSrc: ["'self'", 'https://www.google.com'],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.use('/uploads', express.static(uploadsDir, { maxAge: '30d', immutable: true }));

  app.get(
    '/api/health',
    asyncHandler(async (_req, res) => {
      await query('SELECT 1');
      res.json({ ok: true, database: 'up' });
    }),
  );

  app.use('/api/auth', authRouter);
  app.use('/api/public', catalogRouter);
  app.use('/api/public/orders', publicOrdersRouter);
  app.use('/api/public/reservations', publicReservationsRouter);

  app.use('/api/admin', adminCatalogRouter);
  app.use('/api/admin', adminOrdersRouter);
  app.use('/api/admin', adminReservationsRouter);
  app.use('/api/admin', adminCustomersRouter);
  app.use('/api/admin', adminStatsRouter);
  app.use('/api/admin', adminSettingsRouter);
  app.use('/api/admin/uploads', adminUploadsRouter);

  if (env.isProduction) {
    const clientDist = path.resolve(process.cwd(), '..', 'client', 'dist');
    app.use(express.static(clientDist, { maxAge: '1h' }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        next();
        return;
      }
      res.sendFile(path.join(clientDist, 'index.html'), (error) => {
        if (error) next();
      });
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
