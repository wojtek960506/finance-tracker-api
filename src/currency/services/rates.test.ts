import { describe, expect, it } from 'vitest';

import {
  getCrossRate,
  isValidCurrencyCode,
  roundMoney,
  USD_CURRENCY_CODE,
} from './rates';

describe('currency rates service', () => {
  describe('isValidCurrencyCode', () => {
    it('returns true for valid currency codes', () => {
      expect(isValidCurrencyCode('PLN')).toBe(true);
      expect(isValidCurrencyCode('USD')).toBe(true);
      expect(isValidCurrencyCode('EUR')).toBe(true);
    });

    it('returns false for invalid currency codes or undefined', () => {
      expect(isValidCurrencyCode(undefined)).toBe(false);
      expect(isValidCurrencyCode('')).toBe(false);
      expect(isValidCurrencyCode('INVALID')).toBe(false);
    });
  });

  describe('roundMoney', () => {
    it('rounds numbers to 2 decimal places', () => {
      expect(roundMoney(10.556)).toBe(10.56);
      expect(roundMoney(10.554)).toBe(10.55);
      expect(roundMoney(0)).toBe(0);
      expect(roundMoney(-0.0001)).toBe(0);
    });
  });

  describe('getCrossRate', () => {
    it('returns 1 when currencies are identical', () => {
      expect(getCrossRate('PLN', 'PLN', null)).toBe(1);
      expect(getCrossRate('USD', 'USD', undefined)).toBe(1);
    });

    it('returns null when rates are missing', () => {
      expect(getCrossRate('PLN', 'USD', null)).toBeNull();
      expect(getCrossRate('PLN', 'USD', undefined)).toBeNull();
    });

    it('calculates cross rates correctly with USD as base in rates', () => {
      const rates = {
        PLN: '4.00',
        EUR: '0.90',
        USD: '1.00',
      };

      // USD -> PLN: toRate(4.0) / fromRate(1.0) = 4.0
      expect(getCrossRate(USD_CURRENCY_CODE, 'PLN', rates)).toBe(4);

      // PLN -> USD: toRate(1.0) / fromRate(4.0) = 0.25
      expect(getCrossRate('PLN', USD_CURRENCY_CODE, rates)).toBe(0.25);

      // EUR -> PLN: toRate(4.0) / fromRate(0.9) = 4.4444...
      expect(getCrossRate('EUR', 'PLN', rates)).toBeCloseTo(4.4444, 4);

      // PLN -> EUR: toRate(0.9) / fromRate(4.0) = 0.225
      expect(getCrossRate('PLN', 'EUR', rates)).toBe(0.225);
    });

    it('returns null when a rate is missing or non-positive', () => {
      const rates = {
        PLN: '4.00',
        EUR: '0',
      };

      expect(getCrossRate('PLN', 'GBP', rates)).toBeNull();
      expect(getCrossRate('PLN', 'EUR', rates)).toBeNull();
    });
  });
});
