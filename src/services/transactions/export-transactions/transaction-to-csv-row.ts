import { CategoriesMap } from "@category/services";
import { ITransaction } from "@models/transaction-model";
import { PaymentMethodsMap } from "@payment-method/services";


export const transactionToCsvRow = (
  transaction: ITransaction,
  categoriesMap: CategoriesMap,
  paymentMethodsMap: PaymentMethodsMap,
) => ({
  sourceIndex: transaction.sourceIndex,
  date: transaction.date.toISOString().slice(0,10),
  description: transaction.description,
  amount: transaction.amount,
  currency: transaction.currency,
  category: categoriesMap[transaction.categoryId.toString()].name,
  paymentMethod: paymentMethodsMap[transaction.paymentMethodId.toString()].name,
  account: transaction.account,
  exchangeRate: transaction.exchangeRate,
  currencies: transaction.currencies,
  transactionType: transaction.transactionType,
  sourceRefIndex: transaction.sourceRefIndex
});
