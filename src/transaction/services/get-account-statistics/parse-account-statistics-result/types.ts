import { AccountBalanceStatisticsRow, AccountsMap } from '../types';

export type ParseAccountStatisticsResultParams = {
  accountsMap: AccountsMap;
  baseCurrency?: string;
  latestRates: Record<string, string> | null;
  result: AccountBalanceStatisticsRow[];
};

export type ParsedAccount = {
  accountId: string;
  accountName: string;
  accountType: string;
  totalAmount: number;
  totalItems: number;
  normalizedTotalAmount: number | undefined;
};

export type CurrencyResult = {
  currency: string;
  totalAmount: number;
  totalItems: number;
  normalizedTotalAmount?: number;
  accounts: ParsedAccount[];
};

export type CurrencyResultsMap = Record<string, CurrencyResult>;

export type AccumulateCurrencyResultParams = {
  accountsMap: AccountsMap;
  baseCurrency?: string;
  canNormalize: boolean;
  latestRates: Record<string, string> | null;
};
