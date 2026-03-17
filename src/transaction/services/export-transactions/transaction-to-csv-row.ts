import { AccountsMap } from '@account/services';
import { CategoriesMap } from '@category/services';
import { PaymentMethodsMap } from '@payment-method/services';
import { ITransaction } from '@transaction/model';

export const transactionToCsvRow = (
  transaction: ITransaction,
  categoriesMap: CategoriesMap,
  paymentMethodsMap: PaymentMethodsMap,
  accountsMap: AccountsMap,
) => ({
  sourceIndex: transaction.sourceIndex,
  date: transaction.date.toISOString().slice(0, 10),
  description: transaction.description,
  amount: transaction.amount,
  currency: transaction.currency,
  category: categoriesMap[transaction.categoryId.toString()].name,
  paymentMethod: paymentMethodsMap[transaction.paymentMethodId.toString()].name,
  account: accountsMap[transaction.accountId.toString()].name,
  exchangeRate: transaction.exchangeRate,
  currencies: transaction.currencies,
  transactionType: transaction.transactionType,
  sourceRefIndex: transaction.sourceRefIndex,
});
