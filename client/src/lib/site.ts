export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Eat', to: '/eat' },
  { label: 'Drink', to: '/drink' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export const FOOTER_LINKS = [
  { label: 'Lunch & dinner', to: '/eat' },
  { label: 'Cocktails, beer & wine', to: '/drink' },
  { label: 'Reservations', to: '/reservations' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact', to: '/contact' },
  { label: 'Demo pre-order', to: '/order' },
]

export const EAT_TABS = [
  {
    id: 'lunch' as const,
    label: 'Lunch',
    blurb: 'Midday plates on the roof. Sandwiches are served with fresh watermelon or fries.',
  },
  {
    id: 'dinner' as const,
    label: 'Dinner',
    blurb: 'The evening menu, from shared appetizers to plates for the table.',
  },
]

export const DRINK_TABS = [
  {
    id: 'cocktails' as const,
    label: 'Cocktails',
    blurb: 'House infusions, fresh citrus, and garden herbs.',
  },
  {
    id: 'beer' as const,
    label: 'Beer & Cider',
    blurb: 'Wisconsin and Midwest breweries, plus cider from Ellison Bay.',
  },
  {
    id: 'wine' as const,
    label: 'Wine',
    blurb: 'Rosé and bubbly, white, and red — a short, food-friendly list.',
  },
]

export const HOUSE_NOTES = [
  {
    title: 'Upstairs, under the sky',
    text: 'A rooftop bar and kitchen for lunch, dinner, and drinks in Egg Harbor, Wisconsin.',
  },
  {
    title: 'Cocktails first',
    text: 'The bar builds drinks on fresh citrus, house infusions, and garden herbs — from a Thai basil margarita to a lavender gin fizz.',
  },
  {
    title: 'A short, local list',
    text: 'Beer and cider from Wisconsin and the Midwest, and a compact wine list that moves from Door County rosé to Mendoza malbec.',
  },
]

export const DEMO_LABEL = 'Unofficial redesign proposal'

export const DEMO_SHORT =
  'Local demo only — no real reservations, orders, payments, or emails.'
