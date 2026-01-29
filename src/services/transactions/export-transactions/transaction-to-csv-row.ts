import { ITransaction } from "@models/transaction-model";

export const transactionToCsvRow = (transaction: ITransaction) => ({
  sourceIndex: transaction.sourceIndex,
  date: transaction.date.toISOString().slice(0,10),
  description: transaction.description,
  amount: transaction.amount,
  currency: transaction.currency,
  category: transaction.category,
  paymentMethod: transaction.paymentMethod,
  account: transaction.account,
  exchangeRate: transaction.exchangeRate,
  currencies: transaction.currencies,
  transactionType: transaction.transactionType,
  sourceRefIndex: transaction.sourceRefIndex
});