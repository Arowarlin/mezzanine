import { randomBytes } from 'node:crypto';

/** Alfabeto sin caracteres ambiguos (sin 0/O, 1/I/L). */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function publicCode(prefix: string, length = 5): string {
  const bytes = randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return `${prefix}-${code}`;
}
