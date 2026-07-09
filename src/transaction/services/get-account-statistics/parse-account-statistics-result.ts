import { AccountBalanceStatisticsRow, AccountsMap } from './types';
import { getCrossRate, roundMoney } from './utils';

type ParseAccountStatisticsResultParams = {
  accountsMap: AccountsMap;
  baseCurrency?: string;
  latestRates: Record<string, string> | null;
  result: AccountBalanceStatisticsRow[];
};

type ParsedAccount = {
  accountId: string;
  accountName: string;
  accountType: string;
  totalAmount: number;
  totalItems: number;
  normalizedTotalAmount: number | undefined;
};

type CurrencyResult = {
  currency: string;
  totalAmount: number;
  totalItems: number;
  normalizedTotalAmount?: number;
  accounts: ParsedAccount[];
};

type ResultReducerAccumulator = Record<string, CurrencyResult>;

const sortAccounts = (left: ParsedAccount, right: ParsedAccount, canNormalize: boolean) =>
  (canNormalize
    ? (right.normalizedTotalAmount ?? Number.NEGATIVE_INFINITY) -
      (left.normalizedTotalAmount ?? Number.NEGATIVE_INFINITY)
    : right.totalAmount - left.totalAmount) ||
  right.totalAmount - left.totalAmount ||
  left.accountName.localeCompare(right.accountName);

const sortCurrencies = (
  left: CurrencyResult,
  right: CurrencyResult,
  canNormalize: boolean,
) =>
  canNormalize
    ? (right.normalizedTotalAmount ?? Number.NEGATIVE_INFINITY) -
        (left.normalizedTotalAmount ?? Number.NEGATIVE_INFINITY) ||
      left.currency.localeCompare(right.currency)
    : left.currency.localeCompare(right.currency);

const resultReducer = (
  acc: ResultReducerAccumulator,
  item: AccountBalanceStatisticsRow,
  accountsMap: AccountsMap,
  baseCurrency: string | undefined,
  latestRates: Record<string, string> | null,
) => {
  const crossRatesCache = new Map<string, number | null>();

  const canNormalize = Boolean(baseCurrency && latestRates);
  const accountId = item._id.accountId.toString();
  const currency = item._id.currency;
  const roundedAmount = roundMoney(item.totalAmount);
  const rateCacheKey = baseCurrency ? `${currency}:${baseCurrency}` : '';
  const normalizedRate = (() => {
    if (!canNormalize || !latestRates || !baseCurrency) return null;

    if (!crossRatesCache.has(rateCacheKey)) {
      crossRatesCache.set(
        rateCacheKey,
        getCrossRate(currency, baseCurrency, latestRates),
      );
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
};

export const parseAccountStatisticsResult = ({
  accountsMap,
  baseCurrency,
  latestRates,
  result,
}: ParseAccountStatisticsResultParams) => {
  const canNormalize = Boolean(baseCurrency && latestRates);

  const currencies = Object.values(
    result.reduce<ResultReducerAccumulator>(
      (acc, item) => resultReducer(acc, item, accountsMap, baseCurrency, latestRates),
      {},
    ),
  )
    .map((currency) => ({
      ...currency,
      accounts: currency.accounts.sort((l, r) => sortAccounts(l, r, canNormalize)),
    }))
    .sort((left, right) => sortCurrencies(left, right, canNormalize));

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
