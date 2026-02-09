import { ITransaction } from "@models/transaction-model";
import { CategoriesMap } from "@services/categories";


export const transactionToCsvRow = (
  transaction: ITransaction,
  categoriesMap: CategoriesMap,
) => ({
  sourceIndex: transaction.sourceIndex,
  date: transaction.date.toISOString().slice(0,10),
  description: transaction.description,
  amount: transaction.amount,
  currency: transaction.currency,
  category: categoriesMap[transaction.categoryId.toString()].name,
  paymentMethod: transaction.paymentMethod,
  account: transaction.account,
  exchangeRate: transaction.exchangeRate,
  currencies: transaction.currencies,
  transactionType: transaction.transactionType,
  sourceRefIndex: transaction.sourceRefIndex
});
