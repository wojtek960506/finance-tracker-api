import {
  CATEGORY_TYPE_SYSTEM,
  EXCHANGE_CATEGORY_ID_OBJ,
  EXCHANGE_CATEGORY_ID_STR,
  EXCHANGE_CATEGORY_NAME,
} from '@testing/factories/category';
import { DATE_ISO_STR, DATE_OBJ, USER_ID_STR } from '@testing/factories/general';
import {
  BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ,
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  PAYMENT_METHOD_BANK_TRANSFER_NAME,
  PAYMENT_METHOD_TYPE_SYSTEM,
} from '@testing/factories/payment-method';
import {
  ACCOUNT_EXPENSE,
  AMOUNT_EXPENSE,
  AMOUNT_INCOME,
  CURRENCY_EXPENSE,
  CURRENCY_INCOME,
  DESCRPTION,
  EXCHANGE_TXN_EXPENSE_ID_OBJ,
  EXCHANGE_TXN_EXPENSE_ID_STR,
  EXCHANGE_TXN_EXPENSE_SRC_IDX,
  EXCHANGE_TXN_INCOME_ID_OBJ,
  EXCHANGE_TXN_INCOME_ID_STR,
  EXCHANGE_TXN_INCOME_SRC_IDX,
  TRANSACTION_TYPE_EXPENSE,
  TRANSACTION_TYPE_INCOME,
} from '@testing/factories/transaction';

import {
  TransactionExchangeCreateProps,
  TransactionExchangeUpdateProps,
} from '@transaction/db';
import { TransactionExchangeDTO } from '@transaction/schema';

export const getExchangeTransactionDTO = () =>
  ({
    date: DATE_OBJ,
    account: ACCOUNT_EXPENSE,
    amountIncome: AMOUNT_INCOME,
    amountExpense: AMOUNT_EXPENSE,
    currencyIncome: CURRENCY_INCOME,
    currencyExpense: CURRENCY_EXPENSE,
    additionalDescription: DESCRPTION,
    paymentMethodId: BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  }) as TransactionExchangeDTO;

export function getExchangeTransactionProps(): {
  incomeProps: TransactionExchangeUpdateProps;
  expenseProps: TransactionExchangeUpdateProps;
};
export function getExchangeTransactionProps(isCreate: true): {
  incomeProps: TransactionExchangeCreateProps;
  expenseProps: TransactionExchangeCreateProps;
};
export function getExchangeTransactionProps(isCreate?: true) {
  const commonProps = {
    categoryId: EXCHANGE_CATEGORY_ID_STR,
    date: DATE_OBJ,
    account: ACCOUNT_EXPENSE,
    paymentMethodId: BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
    description: `${CURRENCY_EXPENSE} -> ${CURRENCY_INCOME} (${DESCRPTION})`,
    currencies: `${CURRENCY_INCOME}/${CURRENCY_EXPENSE}`,
    exchangeRate: AMOUNT_EXPENSE / AMOUNT_INCOME,
  };

  const commonExpenseProps = {
    ...commonProps,
    amount: AMOUNT_EXPENSE,
    currency: CURRENCY_EXPENSE,
    transactionType: TRANSACTION_TYPE_EXPENSE,
  };

  const commonIncomeProps = {
    ...commonProps,
    amount: AMOUNT_INCOME,
    currency: CURRENCY_INCOME,
    transactionType: TRANSACTION_TYPE_INCOME,
  };

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
    };
  }
  return {
    expenseProps: commonExpenseProps as TransactionExchangeUpdateProps,
    incomeProps: commonIncomeProps as TransactionExchangeUpdateProps,
  };
}

const tmpCategoryCommon = { type: CATEGORY_TYPE_SYSTEM, name: EXCHANGE_CATEGORY_NAME };
const categoryWithIdObj = { ...tmpCategoryCommon, _id: EXCHANGE_CATEGORY_ID_OBJ };
const categoryWithIdStr = { ...tmpCategoryCommon, id: EXCHANGE_CATEGORY_ID_STR };
const paymentMethodWithIdObj = {
  _id: BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ,
  type: PAYMENT_METHOD_TYPE_SYSTEM,
  name: PAYMENT_METHOD_BANK_TRANSFER_NAME,
};
const paymentMethodWithIdStr = {
  id: BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  type: PAYMENT_METHOD_TYPE_SYSTEM,
  name: PAYMENT_METHOD_BANK_TRANSFER_NAME,
};

export const getExchangeTransactionResultJSON = () => {
  const { expenseProps, incomeProps } = getExchangeTransactionProps(true);
  const commonJSON = {
    date: DATE_ISO_STR,
    categoryId: { ...categoryWithIdObj },
    paymentMethodId: { ...paymentMethodWithIdObj },
  };
  const expenseTransactionJSON = {
    ...expenseProps,
    ...commonJSON, // order of unpacking dict is important due to overwriting `categoryId`
    _id: EXCHANGE_TXN_EXPENSE_ID_OBJ,
    refId: EXCHANGE_TXN_INCOME_ID_OBJ,
  };
  const incomeTransactionJSON = {
    ...incomeProps,
    ...commonJSON, // order of unpacking dict is important due to overwriting `categoryId`
    _id: EXCHANGE_TXN_INCOME_ID_OBJ,
    refId: EXCHANGE_TXN_EXPENSE_ID_OBJ,
  };
  return { expenseTransactionJSON, incomeTransactionJSON };
};

export const getExchangeTransactionNotPopulatedResultJSON = () => {
  const { expenseTransactionJSON, incomeTransactionJSON } =
    getExchangeTransactionResultJSON();
  return {
    expenseTransactionNotPopulatedJSON: {
      ...expenseTransactionJSON,
      categoryId: expenseTransactionJSON.categoryId._id,
      paymentMethodId: expenseTransactionJSON.paymentMethodId._id,
    },
    incomeTransactionNotPopulatedJSON: {
      ...incomeTransactionJSON,
      categoryId: incomeTransactionJSON.categoryId._id,
      paymentMethodId: incomeTransactionJSON.paymentMethodId._id,
    },
  };
};

export const getExchangeTransactionResultSerialized = () => {
  const { expenseProps, incomeProps } = getExchangeTransactionProps(true);
  const { categoryId: _1, paymentMethodId: _2, ...expensePropsRest } = expenseProps;
  const { categoryId: _3, paymentMethodId: _4, ...incomePropsRest } = incomeProps;
  const commonSerialized = {
    date: DATE_ISO_STR,
    category: { ...categoryWithIdStr },
    paymentMethod: { ...paymentMethodWithIdStr },
  };

  const expenseTransactionSerialized = {
    ...expensePropsRest,
    ...commonSerialized,
    id: EXCHANGE_TXN_EXPENSE_ID_STR,
    refId: EXCHANGE_TXN_INCOME_ID_STR,
  };
  const incomeTransactionSerialized = {
    ...incomePropsRest,
    ...commonSerialized,
    id: EXCHANGE_TXN_INCOME_ID_STR,
    refId: EXCHANGE_TXN_EXPENSE_ID_STR,
  };

  return { expenseTransactionSerialized, incomeTransactionSerialized };
};
