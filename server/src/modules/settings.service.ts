import type { RowDataPacket } from 'mysql2/promise';
import { query } from '../db/pool';
import { restaurantDefaults } from '../config/restaurant';

type SettingRow = { setting_key: string; setting_value: string } & RowDataPacket;

export async function getSettingsMap(): Promise<Record<string, string>> {
  const rows = await query<SettingRow>('SELECT setting_key, setting_value FROM settings');
  const map: Record<string, string> = { ...restaurantDefaults };
  for (const row of rows) map[row.setting_key] = row.setting_value;
  return map;
}

export type RestaurantSettings = {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  country: string;
  instagram: string;
  currency: string;
  deliveryFeeCents: number;
  minOrderCents: number;
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  seatsPerSlot: number;
  closedDays: number[];
};

function int(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function getRestaurantSettings(): Promise<RestaurantSettings> {
  const map = await getSettingsMap();
  return {
    name: map.restaurant_name ?? restaurantDefaults.restaurant_name,
    tagline: map.tagline ?? restaurantDefaults.tagline,
    description: map.description ?? restaurantDefaults.description,
    phone: map.phone ?? restaurantDefaults.phone,
    whatsapp: map.whatsapp ?? restaurantDefaults.whatsapp,
    email: map.email ?? restaurantDefaults.email,
    address: map.address ?? restaurantDefaults.address,
    city: map.city ?? restaurantDefaults.city,
    country: map.country ?? restaurantDefaults.country,
    instagram: map.instagram ?? restaurantDefaults.instagram,
    currency: map.currency ?? restaurantDefaults.currency,
    deliveryFeeCents: int(map.delivery_fee_cents, 15000),
    minOrderCents: int(map.min_order_cents, 0),
    openTime: map.open_time ?? restaurantDefaults.open_time,
    closeTime: map.close_time ?? restaurantDefaults.close_time,
    slotMinutes: int(map.slot_minutes, 30),
    seatsPerSlot: int(map.seats_per_slot, 24),
    closedDays: (map.closed_days ?? restaurantDefaults.closed_days)
      .split(',')
      .map((day) => Number.parseInt(day.trim(), 10))
      .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6),
  };
}
