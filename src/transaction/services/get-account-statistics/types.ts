export type AccountBalanceStatisticsRow = {
  _id: {
    accountId: { toString: () => string };
    currency: string;
  };
  totalAmount: number;
  totalItems: number;
};

export type AccountResource = {
  name?: string;
  type?: string;
};

export type AccountsMap = Record<string, AccountResource | undefined>;

export type CurrencyFreaksRatesResponse = {
  base: string;
  date: string;
  rates: Record<string, string>;
};
