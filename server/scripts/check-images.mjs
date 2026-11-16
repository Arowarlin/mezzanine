import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const [rows] = await pool.query(
  `SELECT DISTINCT image_url AS url FROM products WHERE image_url IS NOT NULL
   UNION SELECT DISTINCT image_url FROM categories WHERE image_url IS NOT NULL
   UNION SELECT DISTINCT url FROM gallery_images`,
);
const urls = rows.map((row) => String(row.url));
console.log(`URLs únicas: ${urls.length}`);

const results = await Promise.all(
  urls.map(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
      return { url, status: response.status };
    } catch (error) {
      return { url, status: `ERROR ${error instanceof Error ? error.message : error}` };
    }
  }),
);

const bad = results.filter((item) => item.status !== 200);
console.log(`OK: ${results.length - bad.length} / ${results.length}`);
for (const item of bad) console.log(`  ROTO ${item.status}  ${item.url}`);
await pool.end();
