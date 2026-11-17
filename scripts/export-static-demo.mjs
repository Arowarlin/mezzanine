import { mkdirSync, writeFileSync } from 'node:fs'

const API = process.env.STATIC_DEMO_API ?? 'http://127.0.0.1:4000'
const OUT = 'client/src/data/static-demo.json'

async function get(path) {
  const response = await fetch(`${API}${path}`)
  if (!response.ok) throw new Error(`${path} -> ${response.status}`)
  return response.json()
}

const [settings, categories, products, gallery, careers] = await Promise.all([
  get('/api/public/settings'),
  get('/api/public/categories'),
  get('/api/public/products'),
  get('/api/public/gallery'),
  get('/api/public/careers'),
])

const payload = {
  generatedAt: new Date().toISOString(),
  settings: settings.settings,
  categories: categories.categories,
  products: products.products,
  images: gallery.images,
  openings: careers.openings,
}

mkdirSync('client/src/data', { recursive: true })
writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`)
console.log(`Static demo data written to ${OUT}`)
console.log({
  categories: payload.categories.length,
  products: payload.products.length,
  images: payload.images.length,
  openings: payload.openings.length,
})
