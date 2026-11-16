import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const from = path.join(process.cwd(), 'src', 'db', 'migrations');
const to = path.join(process.cwd(), 'dist', 'db', 'migrations');

await mkdir(to, { recursive: true });
await cp(from, to, { recursive: true });
console.log(`Migraciones copiadas a ${to}`);
