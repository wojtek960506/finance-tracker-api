import { CURRENCY_CODES } from '@currency/schema';

export const USD_CURRENCY_CODE = 'USD';

const VALID_CURRENCY_CODES = new Set<string>(CURRENCY_CODES);

export const isValidCurrencyCode = (value?: string): value is string => {
  if (!value) return false;

  return VALID_CURRENCY_CODES.has(value);
};

export const roundMoney = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals;
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor;

  return Object.is(rounded, -0) ? 0 : rounded;
};

export const getCrossRate = (
  fromCurrency: string,
  toCurrency: string,
  usdBasedRates: Record<string, string> | null | undefined,
): number | null => {
  if (fromCurrency === toCurrency) return 1;
  if (!usdBasedRates) return null;

  const fromRate =
    fromCurrency === USD_CURRENCY_CODE ? 1 : Number(usdBasedRates[fromCurrency]);
  const toRate = toCurrency === USD_CURRENCY_CODE ? 1 : Number(usdBasedRates[toCurrency]);

  if (!Number.isFinite(fromRate) || fromRate <= 0) return null;
  if (!Number.isFinite(toRate) || toRate <= 0) return null;

  return toRate / fromRate;
};
