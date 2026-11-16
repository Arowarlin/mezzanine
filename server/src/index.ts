import type { Server } from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { closePool, query } from './db/pool';

async function main() {
  await query('SELECT 1');

  const app = createApp();
  const server: Server = app.listen(env.PORT, () => {
    console.log(`API Casa Veranda escuchando en http://localhost:${env.PORT}`);
    console.log(`Entorno: ${env.NODE_ENV} · Base de datos: ${env.DB_NAME}@${env.DB_HOST}:${env.DB_PORT}`);
  });

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n${signal} recibido. Cerrando...`);
    server.close(() => {
      void closePool().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('\nNo se pudo arrancar la API:', error instanceof Error ? error.message : error);
  console.error('¿Está levantada la base de datos? Ejecuta: npm run db:start');
  process.exit(1);
});
