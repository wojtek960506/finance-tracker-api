export type TransactionSubcategoryTotals = {
  totalAmount: number;
  totalItems: number;
  averageAmount: number;
  maxAmount: number;
  minAmount: number;
}

export type TransactionTotals = {
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