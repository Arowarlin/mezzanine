/**
 * Datos de marca por defecto. La fuente de verdad en ejecucion es la tabla `settings`;
 * esto solo alimenta el seed y sirve de respaldo si falta una clave.
 */
export const restaurantDefaults = {
  restaurant_name: 'Casa Veranda',
  tagline: 'Cocina caribeña contemporánea',
  description:
    'Producto local, fuego de leña y una terraza que huele a mar. En Casa Veranda cocinamos el Caribe con técnica de autor y sin prisa.',
  phone: '+1 809 555 0142',
  whatsapp: '18095550142',
  email: 'reservas@casaveranda.do',
  address: 'Calle Gustavo Mejía Ricart 45, Piantini',
  city: 'Santo Domingo',
  country: 'República Dominicana',
  instagram: '@casaveranda',
  currency: 'DOP',
  delivery_fee_cents: '15000',
  min_order_cents: '60000',
  open_time: '12:00',
  close_time: '23:00',
  slot_minutes: '30',
  seats_per_slot: '24',
  /** Días cerrados, 0 = domingo ... 6 = sábado. */
  closed_days: '1',
} as const;

export type SettingKey = keyof typeof restaurantDefaults;
