import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  dateStrings: true,
  supportBigNumbers: true,
});

export async function query<T extends RowDataPacket>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.query<T[]>(sql, params);
  return rows;
}

export async function queryOne<T extends RowDataPacket>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [result] = await pool.query<ResultSetHeader>(sql, params);
  return result;
}

export async function withTransaction<T>(handler: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await handler(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
}
