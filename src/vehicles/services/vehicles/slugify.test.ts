import { describe, expect, it } from 'vitest';

import { slugify } from './slugify';

describe('slugify', () => {
  it('converts simple text to kebab-case', () => {
    expect(slugify('Suzuki SV 650')).toBe('suzuki-sv-650');
    expect(slugify('Audi A4 B8')).toBe('audi-a4-b8');
    expect(slugify('Car')).toBe('car');
  });

  it('handles multiple spaces and symbols', () => {
    expect(slugify('  Suzuki   SV--650 (2007)! ')).toBe('suzuki-sv-650-2007');
    expect(slugify('BMW 320d / E90')).toBe('bmw-320d-e90');
  });

  it('strips Polish and European diacritics', () => {
    expect(slugify('Główny Samochód')).toBe('glowny-samochod');
    expect(slugify('Żółty Ścigacz')).toBe('zolty-scigacz');
    expect(slugify('Citroën C4')).toBe('citroen-c4');
  });

  it('handles empty or special character strings', () => {
    expect(slugify('---')).toBe('');
    expect(slugify('')).toBe('');
  });
});
