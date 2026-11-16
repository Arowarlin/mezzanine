/**
 * Datos de marca por defecto para la propuesta local de Mezzanine Rooftop.
 * La fuente de verdad en ejecucion es la tabla `settings`; esto alimenta el seed
 * y sirve de respaldo si falta una clave.
 *
 * Solo se incluyen datos verificados en el sitio oficial o en listados publicos.
 * Los horarios estan marcados como pendientes de confirmacion porque el sitio
 * oficial se contradice (footer "cerrado martes y miercoles" vs. "7 dias, 11-9").
 */
export const restaurantDefaults = {
  restaurant_name: 'Mezzanine',
  tagline: 'Rooftop kitchen & bar · Egg Harbor',
  description:
    'A rooftop kitchen and bar above Egg Harbor, Wisconsin. Cocktails built on fresh citrus and garden herbs, a short list of wine and beer, and a kitchen menu for lunch and dinner.',
  phone: '920-786-7698',
  whatsapp: '',
  email: '',
  address: '7821 Horseshoe Bay Road',
  city: 'Egg Harbor',
  country: 'United States',
  instagram: '@mezzaninerooftop',
  facebook: 'https://www.facebook.com/MezzEggHarbor',
  official_website: 'https://www.mezzaninerooftop.com/',
  currency: 'USD',
  delivery_fee_cents: '0',
  min_order_cents: '0',
  open_time: '11:00',
  close_time: '21:00',
  slot_minutes: '30',
  seats_per_slot: '40',
  /** Dias cerrados, 0 = domingo ... 6 = sabado. Pendiente de confirmar. */
  closed_days: '2,3',
  hours_note:
    'Hours are pending confirmation with the restaurant. The official site currently shows both "closed Tuesday & Wednesday" and "7 days a week, 11am–9pm".',
  demo_mode: 'true',
  demo_notice:
    'Unofficial redesign proposal — local demo only. No real reservations, orders, payments, or emails are processed.',
  hero_title: 'A rooftop table above Egg Harbor.',
  hero_subtitle:
    'Cocktails, wine, and a short kitchen menu — served upstairs, under the sky.',
  about_intro:
    'Mezzanine is the rooftop bar and kitchen at 7821 Horseshoe Bay Road in Egg Harbor, Wisconsin. This proposal is a local, unofficial redesign built to show how the brand could live online.',
  careers_intro:
    'Mezzanine is hiring all positions. Tell us what you do best and we will point you to the right role.',
} as const;

export type SettingKey = keyof typeof restaurantDefaults;
