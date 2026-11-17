/**
 * Carta de bebidas real de Mezzanine.
 *
 * Fuente: https://www.mezzaninerooftop.com/cocktails, /wine y /beer.
 * Nombres, ingredientes, estilos y orígenes tal como aparecen en el sitio
 * oficial (solo se corrigieron erratas evidentes: "ew zealand" → New Zealand,
 * "reisling" → Riesling, "monterray" → Monterey, "castillo" → Castilla).
 *
 * El sitio oficial NO publica precios de bebidas: price_cents = 0 y la web
 * muestra "Ask your server". Las imágenes son ilustraciones propias.
 */

import { menuImage } from './menu-images';

type DrinkMenu = 'cocktails' | 'beer' | 'wine';

export type DrinkProductSeed = {
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  origin: string | null;
  priceCents: number;
  menuType: DrinkMenu;
  image: string | null;
  featured?: boolean;
  sort: number;
};

export type DrinkCategorySeed = {
  name: string;
  slug: string;
  kind: 'drink';
  description: string;
  image: string;
  sort: number;
  products: DrinkProductSeed[];
};

const art = (name: string) => menuImage(name);
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/* -------------------------- COCKTAILS -------------------------- */

const cocktails: Array<[name: string, ingredients: string, featured?: boolean]> = [
  ['Thai Basil Margarita', 'Thai basil, blanco tequila, simple syrup, & fresh lime juice.', true],
  ['Yolanda Be Cool', 'Vodka, strawberry-infused blanco tequila, habanero tincture, lime juice, & simple syrup.', true],
  ['Guava: A Love Story', 'Guava-ginger infused blanco tequila, simple syrup, & lime juice. Topped w/ edible flowers.', true],
  ['Watermelon Cilantro Margarita', 'Watermelon juice, cilantro infused tequila, fresh lime juice, & simple syrup.'],
  ['Cherry Mule', 'Door County cherry juice, vodka, lime juice, & ginger beer.'],
  ['Watermelon Cucumber Cooler', 'House watermelon & cucumber infused vodka, lime juice, simple syrup & seltzer.'],
  ['Supper Club Old Fashioned', 'Brandy, muddled orange and cherry, simple syrup & house bitters w/ choice of sweet or sour wash.', true],
  ['Raspberry Mint Mojito', 'Raspberry-infused white rum, fresh mint, simple syrup, lime juice & seltzer.'],
  ['Lavender Lemon Drop Martini', 'House lavender infused vodka, lemon juice, simple syrup, sugar rim.'],
  ['Lavender Gin Fizz', 'Lavender-infused gin, lemon juice, simple syrup, seltzer.'],
];

/* ----------------------------- WINE ----------------------------- */

// [productor, varietal/estilo, origen]
const wines: Array<[string, string, string]> = [
  // Rosé & bubbly
  ['Door 44 Petite Rosé', 'Petit rosé', 'Sturgeon Bay, Wisconsin'],
  ["L'Agnostique Rosé", 'Rosé-dry', 'France'],
  ['Los Monteros', 'Cava', 'Spain'],
  // White
  ['Innocent Bystander', 'Sauvignon blanc', 'Marlborough, New Zealand'],
  ['Freixenet', 'Pinot grigio', 'Barcelona, Spain'],
  ['Austin Hope', 'Chardonnay-assertive oak', 'Paso Robles, California'],
  ['Bulletin Place', 'Chardonnay-light oak', 'Barossa, Australia'],
  ['Tarrica', 'Riesling', 'Monterey, California'],
  // Red
  ['Don Rodolfo', 'Pinot noir', 'Mendoza, Argentina'],
  ['Casa Santos Lima', 'Red blend', 'Lisboa, Portugal'],
  ['Treana', 'Cabernet', 'Paso Robles, California'],
  ['Ernesto Padrillos Catena', 'Malbec', 'Mendoza, Argentina'],
  ['True Myth', 'Cabernet', 'Paso Robles, California'],
  ['Mesta', 'Tempranillo', 'Castilla, Spain'],
];

const wineArt = (style: string) => {
  const s = style.toLowerCase();
  if (s.includes('cava')) return 'wine-sparkling';
  if (s.includes('rosé')) return 'wine-rose';
  if (/sauvignon|grigio|riesling/.test(s)) return 'wine-white';
  if (s.includes('chardonnay')) return 'wine-chardonnay';
  return 'wine-red';
};

/* ----------------------------- BEER ----------------------------- */

// [nombre, estilo, cervecería, origen, ilustración]
const beers: Array<[string, string, string, string, string]> = [
  ['Narragansett', 'Pilsner', 'Narragansett Brewing', 'Rhode Island', 'beer-pilsner'],
  ['All Day IPA', 'Session IPA', 'Founders', 'Grand Rapids, MI', 'beer-ipa'],
  ['Chaos Pattern', 'Hazy IPA', '3 Sheeps Brewing', 'Sheboygan, WI', 'beer-hazy'],
  ['Honey Blonde', 'Cream ale', 'Central Waters', 'Amherst, WI', 'beer-blonde'],
  ['Little Sister', 'Wheat ale', 'Door County Brewing', 'Door County, WI', 'beer-wheat'],
  ['Ouisconsing', 'Amber/red', 'Central Waters', 'Amherst, WI', 'beer-amber'],
  ['Cherry Wheat', 'Wheat ale', 'Hinterland Brewing', 'Green Bay, WI', 'beer-cherry'],
  ['Cherry Lager', 'Fruited lager', 'One Barrel', 'Door County, WI', 'beer-cherry-lager'],
  ['Island Orchard Cider', 'Cider', 'Island Orchard', 'Ellison Bay, WI', 'beer-cider'],
];

export const drinkCategories: DrinkCategorySeed[] = [
  {
    name: 'Handcrafted Cocktails',
    slug: 'handcrafted-cocktails',
    kind: 'drink',
    description: 'Cocktails built on fresh citrus, house infusions, and garden herbs.',
    image: '/photos/drinks-sunset-cocktails.jpg',
    sort: 6,
    products: cocktails.map(([name, ingredients, featured], index) => ({
      name,
      slug: slugify(name),
      description: null,
      ingredients,
      origin: null,
      priceCents: 0,
      menuType: 'cocktails',
      image: art(`cocktail-${slugify(name)}`),
      featured: Boolean(featured),
      sort: index + 1,
    })),
  },
  {
    name: 'Beer & Cider',
    slug: 'beer-cider',
    kind: 'drink',
    description: 'Packaged beer and cider from Wisconsin and the Midwest.',
    image: menuImage('beer-ipa'),
    sort: 7,
    products: beers.map(([name, style, brewery, place, image], index) => ({
      name,
      slug: slugify(name),
      description: style,
      ingredients: null,
      origin: `${brewery} · ${place}`,
      priceCents: 0,
      menuType: 'beer',
      image: art(image),
      sort: index + 1,
    })),
  },
  {
    name: 'Wine',
    slug: 'wine',
    kind: 'drink',
    description: 'Rosé & bubbly, white, and red.',
    image: menuImage('wine-rose'),
    sort: 8,
    products: wines.map(([name, style, place], index) => ({
      name,
      slug: `wine-${slugify(name)}`,
      description: null,
      ingredients: style,
      origin: place,
      priceCents: 0,
      menuType: 'wine',
      image: art(wineArt(style)),
      sort: index + 1,
    })),
  },
];
