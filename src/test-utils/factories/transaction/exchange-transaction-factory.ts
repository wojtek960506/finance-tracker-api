
import { USER_ID_STR } from "@/test-utils/factories/general";
import { TransactionExchangeDTO } from "@schemas/transaction";
import {
  TransactionExchangeCreateProps,
  TransactionExchangeUpdateProps,
} from "@db/transactions";
import {
  CATEGORY_TYPE_SYSTEM,
  EXCHANGE_CATEGORY_NAME,
  EXCHANGE_CATEGORY_ID_OBJ,
  EXCHANGE_CATEGORY_ID_STR,
} from "@/test-utils/factories/category";
import {
  DATE_OBJ,
  DESCRPTION,
  DATE_ISO_STR,
  AMOUNT_INCOME,
  AMOUNT_EXPENSE,
  PAYMENT_METHOD,
  ACCOUNT_EXPENSE,
  CURRENCY_INCOME,
  CURRENCY_EXPENSE,
  TRANSACTION_TYPE_INCOME,
  TRANSACTION_TYPE_EXPENSE,
  EXCHANGE_TXN_INCOME_ID_STR,
  EXCHANGE_TXN_INCOME_ID_OBJ,
  EXCHANGE_TXN_EXPENSE_ID_STR,
  EXCHANGE_TXN_EXPENSE_ID_OBJ,
  EXCHANGE_TXN_INCOME_SRC_IDX,
  EXCHANGE_TXN_EXPENSE_SRC_IDX,
} from "@/test-utils/factories/transaction";


export const getExchangeTransactionDTO = () => ({
  date: DATE_OBJ,
  account: ACCOUNT_EXPENSE,
  amountIncome: AMOUNT_INCOME,
  amountExpense: AMOUNT_EXPENSE,
  paymentMethod: PAYMENT_METHOD,
  currencyIncome: CURRENCY_INCOME,
  currencyExpense: CURRENCY_EXPENSE,
  additionalDescription: DESCRPTION,
} as TransactionExchangeDTO);

export function getExchangeTransactionProps (): {
  incomeProps: TransactionExchangeUpdateProps,
  expenseProps: TransactionExchangeUpdateProps,
}
export function getExchangeTransactionProps (isCreate: true): {
  incomeProps: TransactionExchangeCreateProps,
  expenseProps: TransactionExchangeCreateProps,
}
export function getExchangeTransactionProps (isCreate?: true) {
  const commonProps = {
    categoryId: EXCHANGE_CATEGORY_ID_STR,
    date: DATE_OBJ,
    account: ACCOUNT_EXPENSE,
    paymentMethod: PAYMENT_METHOD,
    description: `${CURRENCY_EXPENSE} -> ${CURRENCY_INCOME} (${DESCRPTION})`,
    currencies: `${CURRENCY_INCOME}/${CURRENCY_EXPENSE}`,
    exchangeRate: AMOUNT_EXPENSE / AMOUNT_INCOME,
  }

  const commonExpenseProps = {
    ...commonProps,
    amount: AMOUNT_EXPENSE,
    currency: CURRENCY_EXPENSE,
    transactionType: TRANSACTION_TYPE_EXPENSE,
  }

  const commonIncomeProps = {
    ...commonProps,
    amount: AMOUNT_INCOME,
    currency: CURRENCY_INCOME,
    transactionType: TRANSACTION_TYPE_INCOME,
  }

  if (isCreate) {
    return {
      expenseProps: {
        ...commonExpenseProps,
        sourceIndex: EXCHANGE_TXN_EXPENSE_SRC_IDX,
        sourceRefIndex: EXCHANGE_TXN_INCOME_SRC_IDX,
        ownerId: USER_ID_STR,
      } as TransactionExchangeCreateProps,
      incomeProps: {
        ...commonIncomeProps,
        sourceIndex: EXCHANGE_TXN_INCOME_SRC_IDX,
        sourceRefIndex: EXCHANGE_TXN_EXPENSE_SRC_IDX,
        ownerId: USER_ID_STR,
      } as TransactionExchangeCreateProps,
    }
  }
  return {
    expenseProps: commonExpenseProps as TransactionExchangeUpdateProps,
    incomeProps: commonIncomeProps as TransactionExchangeUpdateProps,
  }
}

const tmpCategoryCommon = { type: CATEGORY_TYPE_SYSTEM, name: EXCHANGE_CATEGORY_NAME }
const categoryWithIdObj = { ...tmpCategoryCommon, _id: EXCHANGE_CATEGORY_ID_OBJ }
const categoryWithIdStr = { ...tmpCategoryCommon, id: EXCHANGE_CATEGORY_ID_STR }

export const getExchangeTransactionResultJSON = () => {
  const { expenseProps, incomeProps } = getExchangeTransactionProps(true);
  const expenseTransactionJSON = {
    ...expenseProps,
    _id: EXCHANGE_TXN_EXPENSE_ID_OBJ,
    refId: EXCHANGE_TXN_INCOME_ID_OBJ,
    date: DATE_ISO_STR,
    categoryId: { ...categoryWithIdObj },
  }
  const incomeTransactionJSON = {
    ...incomeProps,
    _id: EXCHANGE_TXN_INCOME_ID_OBJ,
    refId: EXCHANGE_TXN_EXPENSE_ID_OBJ,
    date: DATE_ISO_STR,
    categoryId: { ...categoryWithIdObj },
  }
  return { expenseTransactionJSON, incomeTransactionJSON }
}

export const getExchangeTransactionNotPopulatedResultJSON = () => {
  const { expenseTransactionJSON, incomeTransactionJSON } = getExchangeTransactionResultJSON();
  return {
    expenseTransactionNotPopulatedJSON: {
      ...expenseTransactionJSON,
      categoryId: expenseTransactionJSON.categoryId._id
    },
    incomeTransactionNotPopulatedJSON: {  
      ...incomeTransactionJSON,
      categoryId: incomeTransactionJSON.categoryId._id
    }
  }
}

export const getExchangeTransactionResultSerialized = () => {
  const { expenseProps, incomeProps } = getExchangeTransactionProps(true);
  const { categoryId: categoryId1, ...expensePropsRest } = expenseProps;
  const { categoryId: categoryId2, ...incomePropsRest } = incomeProps;
  const expenseTransactionSerialized = {
    ...expensePropsRest,
    id: EXCHANGE_TXN_EXPENSE_ID_STR,
    refId: EXCHANGE_TXN_INCOME_ID_STR,
    date: DATE_ISO_STR,
    category: { ...categoryWithIdStr },
  }
  const incomeTransactionSerialized = {
    ...incomePropsRest,
    id: EXCHANGE_TXN_INCOME_ID_STR,
    refId: EXCHANGE_TXN_EXPENSE_ID_STR,
    date: DATE_ISO_STR,
    category: { ...categoryWithIdStr },
  }
  return { expenseTransactionSerialized, incomeTransactionSerialized }
}
