import {
  TransactionTotalsOverall,
  TransactionTotalsByCurrency,
  TransactionSubcategoryTotals,
  TransactionTotalsOverallObjDb,
  TransactionTotalsByCurrencyObjDb,  
} from "@routes/transaction-routes/types";


export const parseTotalsByCurrencyResult = (
  transactions: TransactionTotalsByCurrencyObjDb[]
) => {
  const totalsByCurrencies: Record<string, TransactionTotalsByCurrency> = {};

  transactions.forEach(({ _id, ...data }: TransactionTotalsByCurrencyObjDb) => {
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
        totalItems: 0,
        expense: defaultSubcategoryTotals,
        income: defaultSubcategoryTotals,
      }
    }
    
    totalsByCurrencies[currency][transactionType as "expense" | "income"] =
      data as TransactionSubcategoryTotals;
    
    const tmpTotalItems = totalsByCurrencies[currency].totalItems;
    totalsByCurrencies[currency].totalItems = tmpTotalItems + data.totalItems;
  });

  return totalsByCurrencies;
}

export const parseTotalsOverallResult = (
  transactions: TransactionTotalsOverallObjDb[]
) => {
  const totalsOverall = {} as TransactionTotalsOverall;

  let total = 0;
  transactions.forEach(({ _id, totalItems }: TransactionTotalsOverallObjDb) => {
    const { transactionType } = _id;


    totalsOverall[transactionType as "expense" | "income"] = { totalItems };
    total += totalItems;
  })

  totalsOverall.totalItems = total;
  return totalsOverall;
}

