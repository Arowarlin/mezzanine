import { hash } from 'bcryptjs';
import { execute, queryOne, closePool } from './pool';
import { env } from '../config/env';
import { restaurantDefaults } from '../config/restaurant';

const img = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  image: string;
  sort: number;
  products: Array<{
    name: string;
    slug: string;
    description: string;
    priceCents: number;
    image: string;
    featured?: boolean;
    sort: number;
  }>;
};

const categories: CategorySeed[] = [
  {
    name: 'Entradas',
    slug: 'entradas',
    description: 'Para abrir la mesa y compartir sin prisa.',
    image: img('photo-1541529086526-db283c563270'),
    sort: 1,
    products: [
      {
        name: 'Croquetas de yuca con mojo',
        slug: 'croquetas-de-yuca-con-mojo',
        description: 'Yuca crujiente, mojo de ajo asado y un toque de limón criollo.',
        priceCents: 42000,
        image: img('photo-1541529086526-db283c563270'),
        featured: true,
        sort: 1,
      },
      {
        name: 'Tostones con guacamole de la casa',
        slug: 'tostones-con-guacamole',
        description: 'Plátano verde doble fritura, aguacate, cilantro y ají picante suave.',
        priceCents: 38000,
        image: img('photo-1601050690597-df0568f70950'),
        sort: 2,
      },
      {
        name: 'Ensalada de la veranda',
        slug: 'ensalada-de-la-veranda',
        description: 'Hojas de temporada, mango, queso de cabra, almendras tostadas y vinagreta de chinola.',
        priceCents: 48000,
        image: img('photo-1512621776951-a57141f2eefd'),
        sort: 3,
      },
      {
        name: 'Sopa de coco y jengibre',
        slug: 'sopa-de-coco-y-jengibre',
        description: 'Crema suave de coco, jengibre fresco y aceite de cilantro.',
        priceCents: 39000,
        image: img('photo-1547592166-23ac45744acd'),
        sort: 4,
      },
    ],
  },
  {
    name: 'Platos fuertes',
    slug: 'platos-fuertes',
    description: 'Fuego de leña, fondos largos y producto de aquí.',
    image: img('photo-1544025162-d76694265947'),
    sort: 2,
    products: [
      {
        name: 'Chivo guisado de la casa',
        slug: 'chivo-guisado-de-la-casa',
        description: 'Cocción lenta de seis horas, sofrito de la abuela y moro de guandules.',
        priceCents: 115000,
        image: img('photo-1544025162-d76694265947'),
        featured: true,
        sort: 1,
      },
      {
        name: 'Pollo de campo al carbón',
        slug: 'pollo-de-campo-al-carton',
        description: 'Pollo marinado 24 horas, carbón de leña, puré de auyama y jus de hierbas.',
        priceCents: 89000,
        image: img('photo-1598103442097-8b74394b95c6'),
        sort: 2,
      },
      {
        name: 'Mofongo relleno de mariscos',
        slug: 'mofongo-relleno-de-mariscos',
        description: 'Plátano majado con chicharrón, camarones y calamar en salsa de coco.',
        priceCents: 125000,
        image: img('photo-1540189549336-e6e99c3679fe'),
        featured: true,
        sort: 3,
      },
      {
        name: 'Risotto de hongos del bosque',
        slug: 'risotto-de-hongos',
        description: 'Arroz carnaroli, hongos salteados, parmesano curado y aceite de trufa.',
        priceCents: 78000,
        image: img('photo-1476124369491-e7addf5db371'),
        sort: 4,
      },
      {
        name: 'Costillas de la veranda',
        slug: 'costillas-de-la-veranda',
        description: 'Costillas de cerdo glaseadas en tamarindo, encurtidos y papas rústicas.',
        priceCents: 105000,
        image: img('photo-1544025162-d76694265947'),
        sort: 5,
      },
    ],
  },
  {
    name: 'Del mar',
    slug: 'del-mar',
    description: 'Pescado fresco del día, sin adornos de más.',
    image: img('photo-1467003909585-2f8a72700288'),
    sort: 3,
    products: [
      {
        name: 'Pescado del día a la plancha',
        slug: 'pescado-del-dia',
        description: 'Según la pesca del día, con vegetales al wok y beurre blanc de limón.',
        priceCents: 110000,
        image: img('photo-1467003909585-2f8a72700288'),
        featured: true,
        sort: 1,
      },
      {
        name: 'Camarones al ajillo',
        slug: 'camarones-al-ajillo',
        description: 'Camarones jumbo, ajo confitado, guindilla y pan de masa madre.',
        priceCents: 129000,
        image: img('photo-1565680018434-b513d5e5fd47'),
        sort: 2,
      },
      {
        name: 'Pulpo a la brasa',
        slug: 'pulpo-a-la-brasa',
        description: 'Pulpo cocido a baja temperatura, brasa de leña, papas aplastadas y pimentón.',
        priceCents: 145000,
        image: img('photo-1544552866-d3ed42536cfd'),
        sort: 3,
      },
      {
        name: 'Salmón con puré de batata',
        slug: 'salmon-con-pure-de-batata',
        description: 'Salmón sellado, puré de batata, espárragos y salsa de mantequilla de cítricos.',
        priceCents: 119000,
        image: img('photo-1519708227418-c8fd9a32b7a2'),
        sort: 4,
      },
    ],
  },
  {
    name: 'Postres',
    slug: 'postres',
    description: 'El final que se recuerda.',
    image: img('photo-1551024506-0bccd828d307'),
    sort: 4,
    products: [
      {
        name: 'Tres leches de coco',
        slug: 'tres-leches-de-coco',
        description: 'Bizcocho esponjoso, tres leches infusionadas con coco y merengue tostado.',
        priceCents: 32000,
        image: img('photo-1578985545062-69928b1d9587'),
        featured: true,
        sort: 1,
      },
      {
        name: 'Chocolate 70% con sal de mar',
        slug: 'chocolate-70-con-sal-de-mar',
        description: 'Mousse de chocolate amargo, ganache y flor de sal.',
        priceCents: 35000,
        image: img('photo-1551024506-0bccd828d307'),
        sort: 2,
      },
      {
        name: 'Flan de café',
        slug: 'flan-de-cafe',
        description: 'Flan sedoso, café de la casa y caramelo oscuro.',
        priceCents: 30000,
        image: img('photo-1529042410759-befb1204b468'),
        sort: 3,
      },
    ],
  },
  {
    name: 'Bebidas',
    slug: 'bebidas',
    description: 'Coctelería de autor, jugos naturales y café.',
    image: img('photo-1514362545857-3bc16c4c7d1b'),
    sort: 5,
    products: [
      {
        name: 'Jugo de chinola',
        slug: 'jugo-de-chinola',
        description: 'Chinola fresca, un toque de lima y hielo.',
        priceCents: 18000,
        image: img('photo-1546171753-97d7676e4602'),
        sort: 1,
      },
      {
        name: 'Limonada de jengibre',
        slug: 'limonada-de-jengibre',
        description: 'Limón criollo, jengibre fresco y miel de la montaña.',
        priceCents: 16000,
        image: img('photo-1513558161293-cdaf765ed2fd'),
        sort: 2,
      },
      {
        name: 'Café de la casa',
        slug: 'cafe-de-la-casa',
        description: 'Grano de Jarabacoa, tostado medio, servido en V60.',
        priceCents: 12000,
        image: img('photo-1495474472287-4d71bcdd2085'),
        sort: 3,
      },
      {
        name: 'Agua de coco',
        slug: 'agua-de-coco',
        description: 'Coco verde servido al momento.',
        priceCents: 15000,
        image: img('photo-1550258987-190a2d41a8ba'),
        sort: 4,
      },
    ],
  },
];

const gallery = [
  { url: img('photo-1517248135467-4c7edcad34c4'), title: 'El comedor' },
  { url: img('photo-1552566626-52f8b828add9'), title: 'La barra' },
  { url: img('photo-1414235077428-338989a2e8c0'), title: 'Servicio de noche' },
  { url: img('photo-1559339352-11d035aa65de'), title: 'Mesa preparada' },
  { url: img('photo-1551218808-94e220e084d2'), title: 'Del fuego' },
  { url: img('photo-1504674900247-0877df9cc836'), title: 'Para compartir' },
  { url: img('photo-1476224203421-9ac39bcb3327'), title: 'Producto del día' },
  { url: img('photo-1470337458703-46ad1756a187'), title: 'Coctelería' },
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
  const existing = await queryOne<{ id: number } & import('mysql2/promise').RowDataPacket>(
    'SELECT id FROM users WHERE email = ?',
    [env.ADMIN_EMAIL],
  );
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
  for (const category of categories) {
    await execute(
      `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), description = VALUES(description),
         image_url = VALUES(image_url), sort_order = VALUES(sort_order)`,
      [category.name, category.slug, category.description, category.image, category.sort],
    );
    const row = await queryOne<{ id: number } & import('mysql2/promise').RowDataPacket>(
      'SELECT id FROM categories WHERE slug = ?',
      [category.slug],
    );
    if (!row) throw new Error(`No se pudo leer la categoría ${category.slug}`);

    for (const product of category.products) {
      await execute(
        `INSERT INTO products
           (category_id, name, slug, description, price_cents, image_url, is_featured, is_available, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
         ON DUPLICATE KEY UPDATE
           category_id = VALUES(category_id), name = VALUES(name), description = VALUES(description),
           price_cents = VALUES(price_cents), image_url = VALUES(image_url),
           is_featured = VALUES(is_featured), sort_order = VALUES(sort_order)`,
        [
          row.id,
          product.name,
          product.slug,
          product.description,
          product.priceCents,
          product.image,
          product.featured ? 1 : 0,
          product.sort,
        ],
      );
    }
  }
  const total = categories.reduce((sum, category) => sum + category.products.length, 0);
  console.log(`  menú: ${categories.length} categorías, ${total} productos`);
}

async function seedGallery() {
  const existing = await queryOne<{ total: number } & import('mysql2/promise').RowDataPacket>(
    'SELECT COUNT(*) AS total FROM gallery_images',
  );
  if (existing && Number(existing.total) > 0) {
    console.log('  galería: ya tiene imágenes (no se duplican)');
    return;
  }
  for (const [index, item] of gallery.entries()) {
    await execute('INSERT INTO gallery_images (url, title, sort_order, is_active) VALUES (?, ?, ?, 1)', [
      item.url,
      item.title,
      index + 1,
    ]);
  }
  console.log(`  galería: ${gallery.length} imágenes`);
}

async function main() {
  console.log('Sembrando datos de Casa Veranda...');
  await seedSettings();
  await seedAdmin();
  await seedMenu();
  await seedGallery();
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
