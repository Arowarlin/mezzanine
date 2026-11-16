/**
 * Menú real de comida de Mezzanine (Lunch y Dinner 2026).
 *
 * Fuente: imágenes de menú publicadas en
 *   https://www.mezzaninerooftop.com/lunch   (Mezzanine_Lunch_2026)
 *   https://www.mezzaninerooftop.com/dinner  (Mezzanine_Dinner_2026)
 *
 * Nombres, descripciones y precios se copian tal como aparecen en el menú.
 * El asterisco (*) del nombre remite al aviso de alimentos crudos o poco cocidos.
 * Los extras ("add …", "sub …") se añaden al final de la descripción.
 * Imágenes: fotos reales de @mezzaninerooftop donde existen (client/public/photos/);
 * el resto son ilustraciones propias (client/public/menu/*.svg).
 */

import { menuImage } from './menu-images';

type FoodMenu = 'lunch' | 'dinner';

export type FoodProductSeed = {
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  origin: string | null;
  priceCents: number;
  menuType: FoodMenu;
  image: string | null;
  featured?: boolean;
  sort: number;
};

export type FoodCategorySeed = {
  name: string;
  slug: string;
  kind: 'food';
  description: string;
  image: string;
  sort: number;
  products: FoodProductSeed[];
};

const art = (name: string) => menuImage(name);

/** Fotos reales (Instagram @mezzaninerooftop) para los platos que aparecen en ellas. */
const PHOTOS: Record<string, string> = {
  ceviche: '/photos/food-whitefish-ceviche-800.jpg',
  mussels: '/photos/food-fresh-mussels-800.jpg',
  'baja-ahi-tuna': '/photos/food-baja-ahi-tuna-800.jpg',
};

const SHRIMP = 'Add 5 panko crusted shrimp +$8.';
const SUB_FRIES = 'Sub chili-lime fries w/ ancho-garlic aioli for $2.';
const BACON = "Add Nueske's bacon +$2.50.";

type Dish = [name: string, price: number, description: string | null, image: string, extras?: string];

const toProducts = (menu: FoodMenu, dishes: Dish[], featured: string[] = []): FoodProductSeed[] =>
  dishes.map(([name, price, description, image, extras], index) => {
    const slugBase = name
      .toLowerCase()
      .replace(/\*/g, '')
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const text = [description, extras].filter(Boolean).join(' ');
    return {
      name,
      slug: `${menu}-${slugBase}`,
      description: text || null,
      ingredients: null,
      origin: null,
      priceCents: Math.round(price * 100),
      menuType: menu,
      image: menuImage(image, PHOTOS[image]),
      featured: featured.includes(name),
      sort: index + 1,
    };
  });

/* ---------- Textos compartidos (idénticos en ambos menús) ---------- */

const CEVICHE =
  "Fresh locally sourced lake michigan whitefish from bailey's harbor fish company, w/ chili peppers, tomatoes, red onion, avocado crema & organic cilantro micro-greens. Served w/ a medley of house-made malanga chips & white corn chips.";
const POKE =
  'Sashimi-grade ahi tuna, ginger, sesame oil, soy sauce, avocado crema, sesame seeds & green onion. Served w/ a medley of house-made malanga chips & white corn chips.';
const CURDS =
  'Beer-battered white wisconsin cheddar cheese curds. Served w/ choice of cherry preserves or ranch.';
const BREAD = 'Char-grilled rustic loaf served w/ chimichurri.';
const CAKES =
  'W/ ancho-garlic aioli, avocado crema, local whitefish, salmon belly & cilantro micro-greens.';
const CHERRY_SALAD =
  'Dried cherries, red onion, fresh berries, almonds, citrus supremes & field greens dressed w/ honey-lime vinaigrette.';
const BURGER =
  'Hand-pattied 1/2 lb burger w/ pepperjack cheese, green leaf lettuce, avocado, tomato & ancho-garlic aioli.';
const SHRIMP_WRAP =
  'Crispy shrimp w/ habanero-cherry slaw, green leaf lettuce, guacamole, scallions, cilantro & crema anejo.';

/* ---------------------------- LUNCH ---------------------------- */

const lunchAppetizers: Dish[] = [
  ['Whitefish Ceviche*', 16, CEVICHE, 'ceviche'],
  ['Ahi Tuna Poke*', 17, POKE, 'poke'],
  ['Beer-Battered Cheese Curds', 13, CURDS, 'cheese-curds'],
  ['Chili Lime Fries', 12, 'Seasoned w/ our spicy adobo blend, lime juice, scallions, crema anejo & parmesan-romano.', 'chili-lime-fries'],
  ['Guacamole', 12, 'House-made guacamole served w/ chili-lime corn tortilla chips & lime wedges.', 'guacamole'],
  ['Chimichurri Bread', 13, BREAD, 'chimichurri-bread'],
  ['Lake Michigan Whitefish Cakes', 17, CAKES, 'whitefish-cakes'],
];

const lunchPlates: Dish[] = [
  ['Ahi Tuna Tacos*', 20, 'Fresh ahi tuna seared rare w/ habanero-cherry slaw, avocado crema, scallions, sesame oil, soy sauce & cilantro.', 'ahi-tuna-tacos'],
  ['Whitefish Tacos', 18, 'Fried & breaded lake michigan whitefish served w/ habanero-cherry slaw, guacamole, scallions, cilantro & crema anejo.', 'whitefish-tacos'],
  ['Crispy Avocado Shrimp Wrap', 17, SHRIMP_WRAP, 'shrimp-wrap'],
  ['Mezzanine Burger*', 17, BURGER, 'burger', BACON],
  ['Lake Michigan Whitefish Basket', 26, 'Fried & breaded local whitefish w/ ancho-lime fries, house-made tartar, habanero-cherry slaw, buttered bread & lemon slices.', 'whitefish-basket', SHRIMP],
  ["Nueske's BLTA Wrap", 17, "Thick-cut nueske's applewood smoked bacon, tomato, fresh greens, guacamole & garlic aioli.", 'blta-wrap'],
  ['Red Pepper & Basil Oil Capellini', 19, 'Fried garlic w/ spicy red pepper flakes, white wine & lime juice. Tossed w/ capellini & finished w/ basil-infused olive oil & shaved parmesan romano.', 'capellini'],
  ['Mezzanine Whitefish Sandwich', 18, 'Fried & breaded local whitefish w/ tartar sauce, green leaf lettuce, alfalfa sprouts & lemon wedges on a split roll.', 'whitefish-sandwich'],
];

const lunchSoupSalads: Dish[] = [
  ['Honey-Lime Cherry Salad', 19, CHERRY_SALAD, 'cherry-salad', SHRIMP],
  ['Avocado & Bacon Smash Salad', 20, "Cubed avocado, nueske's bacon, red onion, parmesan-romano, malanga crisps, alfalfa sprouts & field greens dressed w/ red wine-lemon vinaigrette & crushed red peppers.", 'smash-salad', SHRIMP],
  ['Soup (Cup)', 6, null, 'soup'],
  ['Soup (Bowl)', 9, null, 'soup'],
  ['Half-Salad', 10, 'Honey-lime cherry salad.', 'cherry-salad'],
];

const lunchDesserts: Dish[] = [
  ['Lavender Flan', 11, null, 'lavender-flan'],
  ['Cherry Crisp', 10, 'A la mode w/ cinnamon ice cream +$2.50.', 'cherry-crisp'],
];

/* ---------------------------- DINNER ---------------------------- */

const dinnerAppetizers: Dish[] = [
  ['Whitefish Ceviche*', 16, CEVICHE, 'ceviche'],
  ['Chimichurri Bread', 13, BREAD, 'chimichurri-bread'],
  ['Lake Michigan Whitefish Cakes*', 17, CAKES, 'whitefish-cakes'],
  ['Fresh Mussels*', 16, 'Fresh mussels sauteed w/ chimichurri, garlic, butter & white wine. Served w/ toasted bread.', 'mussels'],
  ['Beer-Battered Cheese Curds', 13, CURDS, 'cheese-curds'],
  ['Ahi Tuna Poke*', 17, POKE, 'poke'],
];

const dinnerMains: Dish[] = [
  ['Baja Ahi Tuna*', 36, 'Fresh ahi tuna seared rare w/ ginger-sesame rice noodles, red chili peppers, avocado crema, cilantro micro-greens & limes.', 'baja-ahi-tuna'],
  ['8oz Certified Angus Skirt Steak*', 39, 'Seared to medium rare & finished w/ chimichurri. Served w/ garlic mashed potatoes, chimichurri toast & parmesan romano asparagus.', 'skirt-steak', SHRIMP],
  ['Honey-Lime Cherry Salad', 19, CHERRY_SALAD, 'cherry-salad', SHRIMP],
  ['Guajillo Salmon*', 29, 'Chili-lime seasoned salmon grilled to medium & topped w/ a tropical mango-scallion salsa & avocado crema. Served over cilantro lime rice & salsa verde.', 'guajillo-salmon'],
  ['Avocado & Bacon Smash Salad', 20, "Cubed avocado, nueske's bacon, red onion, malanga crisps, parmesan-romano, alfalfa sprouts & field greens dressed w/ red wine-lemon vinaigrette & crushed red peppers.", 'smash-salad', SHRIMP],
  ['Ahi Tuna Tacos*', 20, 'Fresh ahi tuna seared rare w/ habanero-cherry slaw, avocado crema, scallions, sesame oil, soy sauce, sesame seeds & organic cilantro micro-greens. Served w/ fries or fresh watermelon.', 'ahi-tuna-tacos', SUB_FRIES],
  ['Mezzanine Burger*', 17, `${BURGER.replace(/\.$/, '')}. Served w/ fries or fresh watermelon.`, 'burger', `${BACON} ${SUB_FRIES}`],
  ['Crispy Avocado Shrimp Wrap', 17, `${SHRIMP_WRAP.replace(/\.$/, '')}. Served w/ fries or fresh watermelon.`, 'shrimp-wrap', SUB_FRIES],
  ['Red Pepper & Basil Oil Capellini & Mussels*', 26, 'Fried garlic & fresh mussels w/ spicy red pepper flakes, white wine & lime juice. Tossed w/ capellini & finished w/ basil-infused olive oil & shaved parmesan romano.', 'capellini-mussels'],
  ['Breaded Center Cut Chop', 26, 'Lightly breaded & pan-fried pork medallions, served w/ garlic mashed potatoes, parmesan-romano asparagus & tropical salsa.', 'center-cut-chop'],
  ['Lake Michigan Whitefish Platter', 32, 'Pan fried local whitefish served w/ garlic mashed potatoes, parmesan-romano asparagus, buttered bread, house tartar & lemon wedges.', 'whitefish-platter', SHRIMP],
  ['Soup (Cup)', 6, null, 'soup'],
  ['Soup (Bowl)', 9, null, 'soup'],
];

const dinnerDesserts: Dish[] = lunchDesserts;

export const foodCategories: FoodCategorySeed[] = [
  {
    name: 'Appetizers',
    slug: 'appetizers',
    kind: 'food',
    description: 'Plates to share while the sun goes down over the bay.',
    image: '/photos/food-whitefish-ceviche.jpg',
    sort: 1,
    products: [
      ...toProducts('lunch', lunchAppetizers, ['Whitefish Ceviche*']),
      ...toProducts('dinner', dinnerAppetizers, ['Whitefish Ceviche*']),
    ],
  },
  {
    name: 'Lunch',
    slug: 'lunch-plates',
    kind: 'food',
    description:
      'Sandwiches served w/ fresh watermelon or fries. Sub chili-lime fries w/ ancho-garlic aioli for $2.',
    image: art('category-lunch'),
    sort: 2,
    products: toProducts('lunch', lunchPlates, ['Whitefish Tacos', 'Mezzanine Burger*']),
  },
  {
    name: 'Dinner',
    slug: 'dinner-plates',
    kind: 'food',
    description: 'Larger plates for dinner on the roof.',
    image: '/photos/food-baja-ahi-tuna.jpg',
    sort: 3,
    products: toProducts('dinner', dinnerMains, ['Baja Ahi Tuna*', 'Guajillo Salmon*', 'Lake Michigan Whitefish Platter']),
  },
  {
    name: 'Soup & Salads',
    slug: 'soup-salads',
    kind: 'food',
    description: 'Field greens, Door County cherries and a daily soup.',
    image: art('category-salads'),
    sort: 4,
    products: toProducts('lunch', lunchSoupSalads),
  },
  {
    name: 'Desserts',
    slug: 'desserts',
    kind: 'food',
    description: 'A sweet finish, if you are staying a little longer.',
    image: art('category-desserts'),
    sort: 5,
    products: [...toProducts('lunch', lunchDesserts), ...toProducts('dinner', dinnerDesserts)],
  },
];

/** Notas al pie de ambos menús, tal como aparecen en el original. */
export const FOOD_MENU_NOTES = {
  lateNight: 'Late night menu available after 9pm.',
  cash: 'Menu prices reflect discounted cash payment price.',
  raw: '*Consuming raw or undercooked meats, poultry, seafood, shellfish or eggs may increase your risk of foodborne illness.',
};
