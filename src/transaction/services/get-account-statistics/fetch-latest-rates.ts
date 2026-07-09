import { getEnv } from '@app/config/env';

import { USD_CURRENCY_CODE } from './constants';
import { CurrencyFreaksRatesResponse } from './types';

export const fetchLatestRates = async (symbols: string[]) => {
  const { currencyFreaksApiKey } = getEnv();

  if (!currencyFreaksApiKey || symbols.length === 0) return null;

  try {
    const url = new URL('https://api.currencyfreaks.com/v2.0/rates/latest');
    url.searchParams.set('apikey', currencyFreaksApiKey);
    url.searchParams.set('symbols', symbols.join(','));

    const response = await fetch(url);
    if (!response.ok) return null;

    const payload = (await response.json()) as Partial<CurrencyFreaksRatesResponse>;

    if (
      payload.base !== USD_CURRENCY_CODE ||
      !payload.date ||
      !payload.rates ||
      typeof payload.rates !== 'object'
    ) {
      return null;
    }

    return payload as CurrencyFreaksRatesResponse;
  } catch {
    return null;
  }
};
