import { roundMoney } from '../utils';

import { accumulateCurrencyResult } from './accumulate-currency-result';
import { ParseAccountStatisticsResultParams } from './types';
import { sortAccounts, sortCurrencies } from './utils';

export const parseAccountStatisticsResult = ({
  accountsMap,
  baseCurrency,
  latestRates,
  result,
}: ParseAccountStatisticsResultParams) => {
  const canNormalize = Boolean(baseCurrency && latestRates);

  const currencies = Object.values(
    result.reduce(
      accumulateCurrencyResult({ accountsMap, baseCurrency, canNormalize, latestRates }),
      {},
    ),
  )
    .map((currency) => ({
      ...currency,
      accounts: [...currency.accounts].sort(sortAccounts(canNormalize)),
    }))
    .sort(sortCurrencies(canNormalize));

  const normalizedTotalAmount =
    canNormalize && currencies.length > 0
      ? roundMoney(
          currencies.reduce(
            (sum, currency) => sum + (currency.normalizedTotalAmount ?? 0),
            0,
          ),
        )
      : undefined;

  return {
    currencies,
    ...(canNormalize && baseCurrency ? { normalizedBaseCurrency: baseCurrency } : {}),
    ...(normalizedTotalAmount !== undefined ? { normalizedTotalAmount } : {}),
  };
};
