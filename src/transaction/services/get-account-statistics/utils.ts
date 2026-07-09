import { CURRENCY_CODES } from '@currency/schema';

import { USD_CURRENCY_CODE } from './constants';

const VALID_CURRENCY_CODES = new Set<string>(CURRENCY_CODES);

export const isValidCurrencyCode = (value?: string): value is string => {
  if (!value) return false;

  return VALID_CURRENCY_CODES.has(value);
};

export const roundMoney = (value: number) => {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;

  return Object.is(rounded, -0) ? 0 : rounded;
};

export const getCrossRate = (
  fromCurrency: string,
  toCurrency: string,
  usdBasedRates: Record<string, string>,
) => {
  if (fromCurrency === toCurrency) return 1;

  const fromRate =
    fromCurrency === USD_CURRENCY_CODE ? 1 : Number(usdBasedRates[fromCurrency]);
  const toRate = toCurrency === USD_CURRENCY_CODE ? 1 : Number(usdBasedRates[toCurrency]);

  if (!Number.isFinite(fromRate) || fromRate <= 0) return null;
  if (!Number.isFinite(toRate) || toRate <= 0) return null;

  return toRate / fromRate;
};
