import { describe, expect, it } from 'vitest';
import { publicCode } from '../src/lib/codes';
import { digitsOnly, formatMoney } from '../src/lib/money';
import { slugify } from '../src/lib/slug';

describe('slugify', () => {
  it('normaliza acentos y espacios', () => {
    expect(slugify('Café de la casa')).toBe('cafe-de-la-casa');
    expect(slugify('  Crème Brûlée  ')).toBe('creme-brulee');
  });

  it('recorta a 120 caracteres', () => {
    expect(slugify('a'.repeat(200))).toHaveLength(120);
  });
});

describe('publicCode', () => {
  it('usa el prefijo y cinco caracteres sin ambigüedad', () => {
    const code = publicCode('MZ');
    expect(code).toMatch(/^MZ-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{5}$/);
  });

  it('genera códigos distintos', () => {
    expect(publicCode('RS')).not.toBe(publicCode('RS'));
  });
});

describe('money helpers', () => {
  it('formatea centavos en USD', () => {
    expect(formatMoney(2800, 'USD')).toBe('$28.00');
    expect(formatMoney(0, 'USD')).toBe('$0.00');
  });

  it('deja solo dígitos en teléfonos', () => {
    expect(digitsOnly('+1 (920) 786-7698')).toBe('19207867698');
  });
});
