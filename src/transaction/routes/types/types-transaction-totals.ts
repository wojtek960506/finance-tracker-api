export type TransactionSubcategoryTotals = {
  totalAmount: number;
  totalItems: number;
  averageAmount: number;
  maxAmount: number;
  minAmount: number;
}

export type TransactionTotalsByCurrency = {
  totalItems: number,
  expense: TransactionSubcategoryTotals;
  income: TransactionSubcategoryTotals;
}

export type TransactionTotalsByCurrencyObjDb = TransactionSubcategoryTotals & {
  _id: {
    currency: string,
    transactionType: string,
  }
}

export type TransactionTotalsOverallObjDb = { totalItems: number } & {
  _id: { transactionType: string }
}

export type TransactionTotalsOverall = {
  totalItems: number,
  expense: { totalItems: number },
  income: { totalItems: number },
}

export type TransactionTotalsResponse = {
  byCurrency: Record<string, TransactionTotalsByCurrency>,
  overall: TransactionTotalsOverall,
}
