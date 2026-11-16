import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

async function migrationsDir(): Promise<string> {
  const candidates = [path.join(__dirname, 'migrations'), path.join(process.cwd(), 'src', 'db', 'migrations')];
  for (const candidate of candidates) {
    try {
      await readdir(candidate);
      return candidate;
    } catch {
      // siguiente candidato
    }
  }
  throw new Error(`No encuentro la carpeta de migraciones. Buscado en:\n${candidates.join('\n')}`);
}

async function main() {
  const dir = await migrationsDir();
  const files = (await readdir(dir)).filter((file) => file.endsWith('.sql')).sort();

  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true,
    charset: 'utf8mb4_unicode_ci',
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name VARCHAR(190) NOT NULL,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [appliedRows] = await connection.query<mysql.RowDataPacket[]>('SELECT name FROM schema_migrations');
    const applied = new Set(appliedRows.map((row) => String(row.name)));

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  = ${file} (ya aplicada)`);
        continue;
      }
      const sql = await readFile(path.join(dir, file), 'utf8');
      console.log(`  + ${file}`);
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
      count += 1;
    }

    console.log(count === 0 ? '\nBase de datos al día.' : `\n${count} migración(es) aplicada(s).`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('\nError al migrar:', error instanceof Error ? error.message : error);
  process.exit(1);
});
