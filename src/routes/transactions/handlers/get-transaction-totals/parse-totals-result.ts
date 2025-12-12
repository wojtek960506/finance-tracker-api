type TransactionSubcategoryTotals = {
  totalAmount: number;
  totalItems: number;
  averageAmount: number;
  maxAmount: number;
  minAmount: number;
}

type TransactionTotals = {
  expense: TransactionSubcategoryTotals;
  income: TransactionSubcategoryTotals;
}

export type TransactionTotalsObjServer = TransactionSubcategoryTotals & {
  _id: {
    currency: string,
    transactionType: string,
  }
}

export type TransactionTotalsResponse = Record<string, TransactionTotals>

export const parseTotalsResult = (transactions: TransactionTotalsObjServer[]) => {
  const totalsByCurrencies: TransactionTotalsResponse = {};
  transactions.forEach(({ _id, ...data }: TransactionTotalsObjServer) => {
    const defaultSubcategoryTotals = {
      totalAmount: 0,
      totalItems: 0,
      averageAmount: 0,
      maxAmount: 0,
      minAmount: 0,
    }
    const { currency, transactionType } = _id;
    if (!totalsByCurrencies[currency]) {
      totalsByCurrencies[currency] = {
        expense: defaultSubcategoryTotals,
        income: defaultSubcategoryTotals,
      }
    }
    totalsByCurrencies[currency][transactionType as "expense" | "income"] =
      data as TransactionSubcategoryTotals;
  });
  return totalsByCurrencies;
}