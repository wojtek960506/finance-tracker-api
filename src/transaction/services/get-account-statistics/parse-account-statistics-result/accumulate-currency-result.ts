import { AccountBalanceStatisticsRow } from '../types';
import { roundMoney } from '../utils';

import { getNormalizedRate } from './get-normalized-rate';
import { AccumulateCurrencyResultParams, CurrencyResultsMap } from './types';
import { createCurrencyResult } from './utils';

export const accumulateCurrencyResult =
  ({
    accountsMap,
    baseCurrency,
    canNormalize,
    latestRates,
  }: AccumulateCurrencyResultParams) =>
  (acc: CurrencyResultsMap, item: AccountBalanceStatisticsRow) => {
    const crossRatesCache = new Map<string, number | null>();
    const accountId = item._id.accountId.toString();
    const currency = item._id.currency;
    const roundedAmount = roundMoney(item.totalAmount);
    const normalizedRate = getNormalizedRate({
      baseCurrency,
      canNormalize,
      crossRatesCache,
      currency,
      latestRates,
    });
    const normalizedTotalAmount =
      normalizedRate == null ? undefined : roundMoney(roundedAmount * normalizedRate);

    if (!acc[currency]) acc[currency] = createCurrencyResult(currency, canNormalize);

    acc[currency].totalAmount = roundMoney(acc[currency].totalAmount + roundedAmount);
    acc[currency].totalItems += item.totalItems;

    if (normalizedTotalAmount !== undefined) {
      acc[currency].normalizedTotalAmount = roundMoney(
        (acc[currency].normalizedTotalAmount ?? 0) + normalizedTotalAmount,
      );
    }

    acc[currency].accounts.push({
      accountId,
      accountName: accountsMap[accountId]?.name ?? accountId,
      accountType: accountsMap[accountId]?.type ?? 'user',
      totalAmount: roundedAmount,
      totalItems: item.totalItems,
      normalizedTotalAmount,
    });

    return acc;
  };
