import { CurrencyResult, ParsedAccount } from './types';

export const createCurrencyResult = (
  currency: string,
  canNormalize: boolean,
): CurrencyResult => ({
  currency,
  totalAmount: 0,
  totalItems: 0,
  normalizedTotalAmount: canNormalize ? 0 : undefined,
  accounts: [],
});

export const sortAccounts =
  (canNormalize: boolean) => (left: ParsedAccount, right: ParsedAccount) =>
    (canNormalize
      ? (right.normalizedTotalAmount ?? Number.NEGATIVE_INFINITY) -
        (left.normalizedTotalAmount ?? Number.NEGATIVE_INFINITY)
      : right.totalAmount - left.totalAmount) ||
    right.totalAmount - left.totalAmount ||
    left.accountName.localeCompare(right.accountName);

export const sortCurrencies =
  (canNormalize: boolean) => (left: CurrencyResult, right: CurrencyResult) =>
    canNormalize
      ? (right.normalizedTotalAmount ?? Number.NEGATIVE_INFINITY) -
          (left.normalizedTotalAmount ?? Number.NEGATIVE_INFINITY) ||
        left.currency.localeCompare(right.currency)
      : left.currency.localeCompare(right.currency);
