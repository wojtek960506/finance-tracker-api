import { getCrossRate } from '../utils';

type GetNormalizedRateParams = {
  baseCurrency?: string;
  canNormalize: boolean;
  crossRatesCache: Map<string, number | null>;
  currency: string;
  latestRates: Record<string, string> | null;
};

export const getNormalizedRate = ({
  baseCurrency,
  canNormalize,
  crossRatesCache,
  currency,
  latestRates,
}: GetNormalizedRateParams) => {
  if (!canNormalize || !latestRates || !baseCurrency) return null;

  const rateCacheKey = `${currency}:${baseCurrency}`;

  if (!crossRatesCache.has(rateCacheKey)) {
    crossRatesCache.set(rateCacheKey, getCrossRate(currency, baseCurrency, latestRates));
  }

  return crossRatesCache.get(rateCacheKey) ?? null;
};
