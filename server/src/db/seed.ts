import { hash } from 'bcryptjs';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, queryOne, closePool } from './pool';
import { env } from '../config/env';
import { restaurantDefaults } from '../config/restaurant';

/**
 * Seed de la propuesta local de Mezzanine.
 *
 * Reglas de contenido:
 *  - Solo se siembran platos mencionados en listados públicos (Restaurantji,
 *    Door County Pulse, Zmenu) o bebidas verificadas en el sitio oficial.
 *  - Los platos no llevan precio (price_cents = 0) ni descripción inventada:
 *    la interfaz los muestra como "Pricing pending confirmation".
 *  - Las bebidas llevan precios de MUESTRA para que el carrito de demostración
 *    funcione; no son precios reales.
 *  - Todas las filas del catálogo llevan is_demo = 1.
 */

const img = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

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

const COCKTAIL_IMAGES = {
  a: img('photo-1514362545857-3bc16c4c7d1b'),
  b: img('photo-1470337458703-46ad1756a187'),
  c: img('photo-1546171753-97d7676e4602'),
  d: img('photo-1513558161293-cdaf765ed2fd'),
};

const food = (
  name: string,
  slug: string,
  menuType: 'lunch' | 'dinner',
  sort: number,
): ProductSeed => ({
  name,
  slug,
  description: null,
  ingredients: null,
  origin: null,
  priceCents: 0,
  menuType,
  image: null,
  sort,
});

const categories: CategorySeed[] = [
  {
    name: 'Starters',
    slug: 'starters',
    kind: 'food',
    description: 'Small plates and openers for the table.',
    image: img('photo-1541529086526-db283c563270'),
    sort: 1,
    products: [
      food('Whitefish Chowder', 'lunch-whitefish-chowder', 'lunch', 1),
      food('Whitefish Chowder', 'dinner-whitefish-chowder', 'dinner', 1),
      food('Cheese Curds', 'lunch-cheese-curds', 'lunch', 2),
      food('Cheese Curds', 'dinner-cheese-curds', 'dinner', 2),
      food('Smoked Whitefish Dip', 'lunch-smoked-whitefish-dip', 'lunch', 3),
      food('Smoked Whitefish Dip', 'dinner-smoked-whitefish-dip', 'dinner', 3),
      food('Bruschetta', 'lunch-bruschetta', 'lunch', 4),
      food('Bruschetta', 'dinner-bruschetta', 'dinner', 4),
      food('Whitefish Cakes', 'dinner-whitefish-cakes', 'dinner', 5),
      food('Tuna Tacos', 'lunch-tuna-tacos', 'lunch', 6),
      food('Tuna Tacos', 'dinner-tuna-tacos', 'dinner', 6),
    ],
  },
  {
    name: 'Salads',
    slug: 'salads',
    kind: 'food',
    description: 'Greens from the kitchen, sized for a first course or a light meal.',
    image: img('photo-1512621776951-a57141f2eefd'),
    sort: 2,
    products: [
      food('Candied Walnut Salad', 'lunch-candied-walnut-salad', 'lunch', 1),
      food('Candied Walnut Salad', 'dinner-candied-walnut-salad', 'dinner', 1),
    ],
  },
  {
    name: 'Sandwiches',
    slug: 'sandwiches',
    kind: 'food',
    description: 'Lunch plates with a Door County point of view.',
    image: img('photo-1551218808-94e220e084d2'),
    sort: 3,
    products: [
      food('Pastrami Reuben', 'lunch-pastrami-reuben', 'lunch', 1),
      food('Mezzanine Burger', 'lunch-mezzanine-burger', 'lunch', 2),
      food('Mezzanine Burger', 'dinner-mezzanine-burger', 'dinner', 2),
      food('Pulled Pork Sandwich', 'lunch-pulled-pork-sandwich', 'lunch', 3),
      food('Smoked Whitefish Bagel', 'lunch-smoked-whitefish-bagel', 'lunch', 4),
      food('Shrimp Wrap', 'lunch-shrimp-wrap', 'lunch', 5),
    ],
  },
  {
    name: 'Mains',
    slug: 'mains',
    kind: 'food',
    description: 'Larger plates for dinner on the roof.',
    image: img('photo-1544025162-d76694265947'),
    sort: 4,
    products: [
      food('Mushroom Linguine', 'dinner-mushroom-linguine', 'dinner', 1),
      food('Pesto Linguine', 'dinner-pesto-linguine', 'dinner', 2),
      food('Pan Fried Whitefish', 'dinner-pan-fried-whitefish', 'dinner', 3),
      food('Pork Chop', 'dinner-pork-chop', 'dinner', 4),
      food('Tenderloin', 'dinner-tenderloin', 'dinner', 5),
    ],
  },
  {
    name: 'Desserts',
    slug: 'desserts',
    kind: 'food',
    description: 'A sweet finish, if you are staying a little longer.',
    image: img('photo-1551024506-0bccd828d307'),
    sort: 5,
    products: [food('Lavender Crème Brûlée', 'dinner-lavender-creme-brulee', 'dinner', 1)],
  },
  {
    name: 'Handcrafted Cocktails',
    slug: 'handcrafted-cocktails',
    kind: 'drink',
    description:
      'Cocktails built on fresh citrus, house infusions, and garden herbs. Ingredient lists are taken from the official menu; prices are sample values for this demo.',
    image: COCKTAIL_IMAGES.a,
    sort: 6,
    products: [
      {
        name: 'Thai Basil Margarita',
        slug: 'thai-basil-margarita',
        description: null,
        ingredients: 'Thai basil, blanco tequila, simple syrup, fresh lime.',
        origin: null,
        priceCents: 1400,
        menuType: 'cocktails',
        image: COCKTAIL_IMAGES.a,
        featured: true,
        sort: 1,
      },
      {
        name: 'Yolanda Be Cool',
        slug: 'yolanda-be-cool',
        description: null,
        ingredients: 'Vodka, strawberry-infused blanco tequila, habanero tincture, lime, simple syrup.',
        origin: null,
        priceCents: 1500,
        menuType: 'cocktails',
        image: COCKTAIL_IMAGES.b,
        featured: true,
        sort: 2,
      },
      {
        name: 'Guava: A Love Story',
        slug: 'guava-a-love-story',
        description: null,
        ingredients: 'Guava-ginger infused blanco tequila, simple syrup, lime, edible flowers.',
        origin: null,
        priceCents: 1500,
        menuType: 'cocktails',
        image: COCKTAIL_IMAGES.c,
        featured: true,
        sort: 3,
      },
      {
        name: 'Watermelon Cilantro Margarita',
        slug: 'watermelon-cilantro-margarita',
        description: null,
        ingredients: 'Watermelon juice, cilantro-infused tequila, lime, simple syrup.',
        origin: null,
        priceCents: 1400,
        menuType: 'cocktails',
        image: COCKTAIL_IMAGES.d,
        sort: 4,
      },
      {
        name: 'Cherry Mule',
        slug: 'cherry-mule',
        description: null,
        ingredients: 'Door County cherry juice, vodka, lime, ginger beer.',
        origin: null,
        priceCents: 1300,
        menuType: 'cocktails',
        image: COCKTAIL_IMAGES.a,
        sort: 5,
      },
      {
        name: 'Watermelon Cucumber Cooler',
        slug: 'watermelon-cucumber-cooler',
        description: null,
        ingredients: 'House watermelon and cucumber infused vodka, lime, simple syrup, seltzer.',
        origin: null,
        priceCents: 1300,
        menuType: 'cocktails',
        image: COCKTAIL_IMAGES.b,
        sort: 6,
      },
      {
        name: 'Supper Club Old Fashioned',
        slug: 'supper-club-old-fashioned',
        description: null,
        ingredients: 'Brandy, muddled orange and cherry, simple syrup, house bitters, sweet or sour wash.',
        origin: null,
        priceCents: 1400,
        menuType: 'cocktails',
        image: COCKTAIL_IMAGES.c,
        featured: true,
        sort: 7,
      },
      {
        name: 'Raspberry Mint Mojito',
        slug: 'raspberry-mint-mojito',
        description: null,
        ingredients: 'Raspberry-infused white rum, mint, simple syrup, lime, seltzer.',
        origin: null,
        priceCents: 1300,
        menuType: 'cocktails',
        image: COCKTAIL_IMAGES.d,
        sort: 8,
      },
      {
        name: 'Lavender Lemon Drop Martini',
        slug: 'lavender-lemon-drop-martini',
        description: null,
        ingredients: 'House lavender infused vodka, lemon, simple syrup, sugar rim.',
        origin: null,
        priceCents: 1500,
        menuType: 'cocktails',
        image: COCKTAIL_IMAGES.a,
        sort: 9,
      },
      {
        name: 'Lavender Gin Fizz',
        slug: 'lavender-gin-fizz',
        description: null,
        ingredients: 'Lavender-infused gin, lemon, simple syrup, seltzer.',
        origin: null,
        priceCents: 1400,
        menuType: 'cocktails',
        image: COCKTAIL_IMAGES.b,
        sort: 10,
      },
    ],
  },
  {
    name: 'Beer & Cider',
    slug: 'beer-cider',
    kind: 'drink',
    description:
      'A short list of Wisconsin and Midwest beer and cider. Styles and origins are taken from the official menu; prices are sample values for this demo.',
    image: img('photo-1513558161293-cdaf765ed2fd'),
    sort: 7,
    products: [
      {
        name: 'Narragansett',
        slug: 'narragansett',
        description: 'Pilsner',
        ingredients: null,
        origin: 'Narragansett Brewing Co. · Rhode Island',
        priceCents: 600,
        menuType: 'beer',
        image: null,
        sort: 1,
      },
      {
        name: 'All Day IPA',
        slug: 'all-day-ipa',
        description: 'Session IPA',
        ingredients: null,
        origin: 'Founders Brewing Co. · Grand Rapids, Michigan',
        priceCents: 700,
        menuType: 'beer',
        image: null,
        sort: 2,
      },
      {
        name: 'Chaos Pattern',
        slug: 'chaos-pattern',
        description: 'Hazy IPA',
        ingredients: null,
        origin: '3 Sheeps Brewing · Sheboygan, Wisconsin',
        priceCents: 800,
        menuType: 'beer',
        image: null,
        sort: 3,
      },
      {
        name: 'Honey Blonde',
        slug: 'honey-blonde',
        description: 'Cream ale',
        ingredients: null,
        origin: 'Central Waters Brewing · Amherst, Wisconsin',
        priceCents: 700,
        menuType: 'beer',
        image: null,
        sort: 4,
      },
      {
        name: 'Little Sister',
        slug: 'little-sister',
        description: 'Wheat ale',
        ingredients: null,
        origin: 'Door County Brewing Co. · Wisconsin',
        priceCents: 700,
        menuType: 'beer',
        image: null,
        sort: 5,
      },
      {
        name: 'Ouisconsing',
        slug: 'ouisconsing',
        description: 'Amber / red ale',
        ingredients: null,
        origin: 'Central Waters Brewing · Amherst, Wisconsin',
        priceCents: 700,
        menuType: 'beer',
        image: null,
        sort: 6,
      },
      {
        name: 'Cherry Wheat',
        slug: 'cherry-wheat',
        description: 'Wheat ale',
        ingredients: null,
        origin: 'Hinterland Brewery · Green Bay, Wisconsin',
        priceCents: 700,
        menuType: 'beer',
        image: null,
        sort: 7,
      },
      {
        name: 'Cherry Lager',
        slug: 'cherry-lager',
        description: 'Fruited lager',
        ingredients: null,
        origin: 'One Barrel Brewing · Door County, Wisconsin',
        priceCents: 700,
        menuType: 'beer',
        image: null,
        sort: 8,
      },
      {
        name: 'Island Orchard Cider',
        slug: 'island-orchard-cider',
        description: 'Cider',
        ingredients: null,
        origin: 'Island Orchard Cidery · Ellison Bay, Wisconsin',
        priceCents: 800,
        menuType: 'beer',
        image: null,
        sort: 9,
      },
    ],
  },
  {
    name: 'Wine',
    slug: 'wine',
    kind: 'drink',
    description:
      'Rosé and bubbly, white, and red by the glass or bottle. Origins and tasting notes are taken from the official menu; prices are sample values for this demo.',
    image: img('photo-1470337458703-46ad1756a187'),
    sort: 8,
    products: [
      {
        name: 'Door 44 Petite Rosé',
        slug: 'door-44-petite-rose',
        description: null,
        ingredients: 'Rosé',
        origin: 'Door 44 Winery · Sturgeon Bay, Wisconsin',
        priceCents: 1200,
        menuType: 'wine',
        image: null,
        sort: 1,
      },
      {
        name: "L'Agnostique Rosé",
        slug: 'lagnostique-rose',
        description: 'Dry',
        ingredients: 'Rosé',
        origin: 'France',
        priceCents: 1200,
        menuType: 'wine',
        image: null,
        sort: 2,
      },
      {
        name: 'Los Monteros Cava',
        slug: 'los-monteros-cava',
        description: 'Sparkling',
        ingredients: 'Cava',
        origin: 'Spain',
        priceCents: 1300,
        menuType: 'wine',
        image: null,
        sort: 3,
      },
      {
        name: 'Innocent Bystander Sauvignon Blanc',
        slug: 'innocent-bystander-sauvignon-blanc',
        description: null,
        ingredients: 'Sauvignon Blanc',
        origin: 'Marlborough, New Zealand',
        priceCents: 1300,
        menuType: 'wine',
        image: null,
        sort: 4,
      },
      {
        name: 'Freixenet Pinot Grigio',
        slug: 'freixenet-pinot-grigio',
        description: null,
        ingredients: 'Pinot Grigio',
        origin: 'Barcelona, Spain',
        priceCents: 1100,
        menuType: 'wine',
        image: null,
        sort: 5,
      },
      {
        name: 'Austin Hope Chardonnay',
        slug: 'austin-hope-chardonnay',
        description: 'Assertive oak',
        ingredients: 'Chardonnay',
        origin: 'Paso Robles, California',
        priceCents: 1800,
        menuType: 'wine',
        image: null,
        sort: 6,
      },
      {
        name: 'Bulletin Place Chardonnay',
        slug: 'bulletin-place-chardonnay',
        description: 'Light oak',
        ingredients: 'Chardonnay',
        origin: 'Barossa, Australia',
        priceCents: 1400,
        menuType: 'wine',
        image: null,
        sort: 7,
      },
      {
        name: 'Tarrica Riesling',
        slug: 'tarrica-riesling',
        description: null,
        ingredients: 'Riesling',
        origin: 'Monterey, California',
        priceCents: 1200,
        menuType: 'wine',
        image: null,
        sort: 8,
      },
      {
        name: 'Don Rodolfo Pinot Noir',
        slug: 'don-rodolfo-pinot-noir',
        description: null,
        ingredients: 'Pinot Noir',
        origin: 'Mendoza, Argentina',
        priceCents: 1300,
        menuType: 'wine',
        image: null,
        sort: 9,
      },
      {
        name: 'Casa Santos Lima Red Blend',
        slug: 'casa-santos-lima-red-blend',
        description: null,
        ingredients: 'Red blend',
        origin: 'Lisboa, Portugal',
        priceCents: 1200,
        menuType: 'wine',
        image: null,
        sort: 10,
      },
      {
        name: 'Treana Cabernet',
        slug: 'treana-cabernet',
        description: null,
        ingredients: 'Cabernet Sauvignon',
        origin: 'Paso Robles, California',
        priceCents: 1800,
        menuType: 'wine',
        image: null,
        sort: 11,
      },
      {
        name: 'Ernesto Padrillos Catena Malbec',
        slug: 'ernesto-padrillos-catena-malbec',
        description: null,
        ingredients: 'Malbec',
        origin: 'Mendoza, Argentina',
        priceCents: 1600,
        menuType: 'wine',
        image: null,
        sort: 12,
      },
      {
        name: 'True Myth Cabernet',
        slug: 'true-myth-cabernet',
        description: null,
        ingredients: 'Cabernet Sauvignon',
        origin: 'Paso Robles, California',
        priceCents: 1500,
        menuType: 'wine',
        image: null,
        sort: 13,
      },
      {
        name: 'Mesta Tempranillo',
        slug: 'mesta-tempranillo',
        description: null,
        ingredients: 'Tempranillo',
        origin: 'Castilla, Spain',
        priceCents: 1300,
        menuType: 'wine',
        image: null,
        sort: 14,
      },
    ],
  },
];

const gallery: Array<{ url: string; title: string; category: string }> = [
  { url: img('photo-1517248135467-4c7edcad34c4'), title: 'The dining room', category: 'rooftop' },
  { url: img('photo-1552566626-52f8b828add9'), title: 'The bar', category: 'rooftop' },
  { url: img('photo-1414235077428-338989a2e8c0'), title: 'Evening service', category: 'rooftop' },
  { url: img('photo-1559339352-11d035aa65de'), title: 'A table set for dinner', category: 'space' },
  { url: img('photo-1551218808-94e220e084d2'), title: 'From the kitchen', category: 'food' },
  { url: img('photo-1504674900247-0877df9cc836'), title: 'Plates for the table', category: 'food' },
  { url: img('photo-1476224203421-9ac39bcb3327'), title: 'Seasonal produce', category: 'food' },
  { url: img('photo-1470337458703-46ad1756a187'), title: 'Behind the bar', category: 'drinks' },
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
