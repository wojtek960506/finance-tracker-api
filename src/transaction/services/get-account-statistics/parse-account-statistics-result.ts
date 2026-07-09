import { AccountBalanceStatisticsRow, AccountsMap } from './types';
import { getCrossRate, roundMoney } from './utils';

type ParseAccountStatisticsResultParams = {
  accountsMap: AccountsMap;
  baseCurrency?: string;
  latestRates: Record<string, string> | null;
  result: AccountBalanceStatisticsRow[];
};

export const parseAccountStatisticsResult = ({
  accountsMap,
  baseCurrency,
  latestRates,
  result,
}: ParseAccountStatisticsResultParams) => {
  // TODO: Split this file further and review the helper boundaries in the next commit.
  const canNormalize = Boolean(baseCurrency && latestRates);
  const crossRatesCache = new Map<string, number | null>();

  const currencies = Object.values(
    result.reduce<
      Record<
        string,
        {
          currency: string;
          totalAmount: number;
          totalItems: number;
          normalizedTotalAmount?: number;
          accounts: any[];
        }
      >
    >((acc, item) => {
      const accountId = item._id.accountId.toString();
      const currency = item._id.currency;
      const roundedAmount = roundMoney(item.totalAmount);
      const rateCacheKey = baseCurrency ? `${currency}:${baseCurrency}` : '';
      const normalizedRate = (() => {
        if (!canNormalize || !latestRates || !baseCurrency) return null;

        if (!crossRatesCache.has(rateCacheKey)) {
          crossRatesCache.set(rateCacheKey, getCrossRate(currency, baseCurrency, latestRates));
        }

        return crossRatesCache.get(rateCacheKey) ?? null;
      })();
      const normalizedTotalAmount =
        normalizedRate == null ? undefined : roundMoney(roundedAmount * normalizedRate);

      if (!acc[currency]) {
        acc[currency] = {
          currency,
          totalAmount: 0,
          totalItems: 0,
          normalizedTotalAmount: canNormalize ? 0 : undefined,
          accounts: [],
        };
      }

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
    }, {}),
  )
    .map((currency) => ({
      ...currency,
      accounts: currency.accounts.sort(
        (left, right) =>
          (canNormalize
            ? (right.normalizedTotalAmount ?? Number.NEGATIVE_INFINITY) -
              (left.normalizedTotalAmount ?? Number.NEGATIVE_INFINITY)
            : right.totalAmount - left.totalAmount) ||
          right.totalAmount - left.totalAmount ||
          left.accountName.localeCompare(right.accountName),
      ),
    }))
    .sort((left, right) =>
      canNormalize
        ? (right.normalizedTotalAmount ?? Number.NEGATIVE_INFINITY) -
            (left.normalizedTotalAmount ?? Number.NEGATIVE_INFINITY) ||
          left.currency.localeCompare(right.currency)
        : left.currency.localeCompare(right.currency),
    );

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
