import { hash } from 'bcryptjs';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, queryOne, closePool } from './pool';
import { env } from '../config/env';
import { restaurantDefaults } from '../config/restaurant';
import { foodCategories } from './food-menu';
import { drinkCategories } from './drink-menu';

/**
 * Seed de la propuesta local de Mezzanine.
 *
 * Reglas de contenido:
 *  - Comida: menú real de Lunch y Dinner 2026 de mezzaninerooftop.com, con
 *    nombres, descripciones y precios exactos (ver ./food-menu.ts).
 *  - Las imágenes de comida son ilustraciones propias, no fotos del restaurante.
 *  - Bebidas: carta real de cocktails, wine y beer (ver ./drink-menu.ts). El
 *    sitio oficial no publica precios de bebidas, así que van sin precio.
 *  - Todas las filas del catálogo llevan is_demo = 1.
 */

type ProductSeed = {
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  origin: string | null;
  priceCents: number;
  menuType: 'lunch' | 'dinner' | 'cocktails' | 'beer' | 'wine';
  image: string | null;
  featured?: boolean;
  sort: number;
};

type CategorySeed = {
  name: string;
  slug: string;
  kind: 'food' | 'drink';
  description: string;
  image: string;
  sort: number;
  products: ProductSeed[];
};

const categories: CategorySeed[] = [
  ...foodCategories,
  ...drinkCategories,
];

// Fotos de Instagram @mezzaninerooftop (2026), optimizadas en client/public/photos/.
const photo = (name: string) => `/photos/${name}.jpg`;

const gallery: Array<{ url: string; title: string; category: string }> = [
  { url: photo('venue-sunset-bay'), title: 'Sunset over Horseshoe Bay', category: 'rooftop' },
  { url: photo('venue-rooftop-deck'), title: 'The rooftop deck', category: 'rooftop' },
  { url: photo('food-baja-ahi-tuna'), title: 'Baja ahi tuna', category: 'food' },
  { url: photo('drinks-sunset-cocktails'), title: 'Cocktails at sunset', category: 'drinks' },
  { url: photo('venue-fall-table'), title: 'Autumn on the roof', category: 'rooftop' },
  { url: photo('food-fresh-mussels'), title: 'Fresh mussels', category: 'food' },
  { url: photo('drinks-citrus-cocktail'), title: 'A citrus cocktail', category: 'drinks' },
  { url: photo('venue-entrance'), title: 'The entrance on Horseshoe Bay Road', category: 'space' },
  { url: photo('food-whitefish-ceviche'), title: 'Whitefish ceviche', category: 'food' },
  { url: photo('drinks-basil-cocktail'), title: 'Golden hour', category: 'drinks' },
];

const careers: Array<{ title: string; description: string; employmentType: string }> = [
  {
    title: 'All positions',
    description:
      'Mezzanine is hiring for all positions. Tell us what you do best — front of house, kitchen, or bar — and we will point you to the right role.',
    employmentType: 'full_time',
  },
];

async function seedSettings() {
  for (const [key, value] of Object.entries(restaurantDefaults)) {
    await execute(
      `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, value],
    );
  }
  console.log(`  settings: ${Object.keys(restaurantDefaults).length} claves`);
}

async function seedAdmin() {
  const existing = await queryOne<{ id: number } & RowDataPacket>('SELECT id FROM users WHERE email = ?', [
    env.ADMIN_EMAIL,
  ]);
  if (existing) {
    console.log(`  admin: ya existe ${env.ADMIN_EMAIL} (no se cambia la contraseña)`);
    return;
  }
  const passwordHash = await hash(env.ADMIN_PASSWORD, 12);
  await execute('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [
    env.ADMIN_NAME,
    env.ADMIN_EMAIL,
    passwordHash,
    'admin',
  ]);
  console.log(`  admin: creado ${env.ADMIN_EMAIL}`);
}

async function seedMenu() {
  // El catálogo es de demostración: se reemplaza entero. Los pedidos y reservas
  // existentes se conservan; order_items.product_id queda en NULL por la FK.
  await execute('DELETE FROM products');
  await execute('DELETE FROM categories');

  for (const category of categories) {
    await execute(
      `INSERT INTO categories (name, slug, kind, description, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [category.name, category.slug, category.kind, category.description, category.image, category.sort],
    );
    const row = await queryOne<{ id: number } & RowDataPacket>('SELECT id FROM categories WHERE slug = ?', [
      category.slug,
    ]);
    if (!row) throw new Error(`No se pudo leer la categoría ${category.slug}`);

    for (const product of category.products) {
      await execute(
        `INSERT INTO products
           (category_id, name, slug, description, ingredients, origin, price_cents, menu_type,
            image_url, is_featured, is_available, is_demo, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)`,
        [
          row.id,
          product.name,
          product.slug,
          product.description,
          product.ingredients,
          product.origin,
          product.priceCents,
          product.menuType,
          product.image,
          product.featured ? 1 : 0,
          product.sort,
        ],
      );
    }
  }

  const total = categories.reduce((sum, category) => sum + category.products.length, 0);
  console.log(`  menú: ${categories.length} categorías, ${total} productos (todos demo)`);
}

async function seedGallery() {
  await execute('DELETE FROM gallery_images');
  for (const [index, item] of gallery.entries()) {
    await execute(
      'INSERT INTO gallery_images (url, title, category, sort_order, is_active) VALUES (?, ?, ?, ?, 1)',
      [item.url, item.title, item.category, index + 1],
    );
  }
  console.log(`  galería: ${gallery.length} imágenes`);
}

async function seedCareers() {
  await execute('DELETE FROM career_openings');
  for (const [index, item] of careers.entries()) {
    await execute(
      `INSERT INTO career_openings (title, description, employment_type, sort_order, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [item.title, item.description, item.employmentType, index + 1],
    );
  }
  console.log(`  empleos: ${careers.length} puestos`);
}

async function main() {
  console.log('Sembrando datos de Mezzanine (demo local)...');
  await seedSettings();
  await seedAdmin();
  await seedMenu();
  await seedGallery();
  await seedCareers();
  console.log('\nSeed completado.');
}

main()
  .catch((error) => {
    console.error('\nError en el seed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
