import {
  CATEGORY_TYPE_SYSTEM,
  TRANSFER_CATEGORY_ID_OBJ,
  TRANSFER_CATEGORY_ID_STR,
  TRANSFER_CATEGORY_NAME,
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
  ACCOUNT_INCOME,
  AMOUNT_EXPENSE,
  CURRENCY_EXPENSE,
  DESCRPTION,
  TRANSACTION_TYPE_EXPENSE,
  TRANSACTION_TYPE_INCOME,
  TRANSFER_TXN_EXPENSE_ID_OBJ,
  TRANSFER_TXN_EXPENSE_ID_STR,
  TRANSFER_TXN_EXPENSE_SRC_IDX,
  TRANSFER_TXN_INCOME_ID_OBJ,
  TRANSFER_TXN_INCOME_ID_STR,
  TRANSFER_TXN_INCOME_SRC_IDX,
} from '@testing/factories/transaction';

import {
  TransactionTransferCreateProps,
  TransactionTransferUpdateProps,
} from '@transaction/db';
import { TransactionTransferDTO } from '@transaction/schema';

export const getTransferTransactionDTO = () =>
  ({
    date: DATE_OBJ,
    amount: AMOUNT_EXPENSE,
    currency: CURRENCY_EXPENSE,
    accountIncome: ACCOUNT_INCOME,
    accountExpense: ACCOUNT_EXPENSE,
    additionalDescription: DESCRPTION,
    paymentMethodId: BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  }) as TransactionTransferDTO;

export function getTransferTransactionProps(): {
  incomeProps: TransactionTransferUpdateProps;
  expenseProps: TransactionTransferUpdateProps;
};
export function getTransferTransactionProps(isCreate: true): {
  incomeProps: TransactionTransferCreateProps;
  expenseProps: TransactionTransferCreateProps;
};
export function getTransferTransactionProps(isCreate?: true) {
  const commonProps = {
    date: DATE_OBJ,
    amount: AMOUNT_EXPENSE,
    currency: CURRENCY_EXPENSE,
    paymentMethodId: BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
    categoryId: TRANSFER_CATEGORY_ID_STR,
    description: `${ACCOUNT_EXPENSE} --> ${ACCOUNT_INCOME} (${DESCRPTION})`,
  };

  const commonExpenseProps = {
    ...commonProps,
    account: ACCOUNT_EXPENSE,
    transactionType: TRANSACTION_TYPE_EXPENSE,
  };

  const commonIncomeProps = {
    ...commonProps,
    account: ACCOUNT_INCOME,
    transactionType: TRANSACTION_TYPE_INCOME,
  };

  if (isCreate) {
    return {
      expenseProps: {
        ...commonExpenseProps,
        ownerId: USER_ID_STR,
        sourceIndex: TRANSFER_TXN_EXPENSE_SRC_IDX,
        sourceRefIndex: TRANSFER_TXN_INCOME_SRC_IDX,
      } as TransactionTransferCreateProps,
      incomeProps: {
        ...commonIncomeProps,
        ownerId: USER_ID_STR,
        sourceIndex: TRANSFER_TXN_INCOME_SRC_IDX,
        sourceRefIndex: TRANSFER_TXN_EXPENSE_SRC_IDX,
      } as TransactionTransferCreateProps,
    };
  } else {
    return {
      incomeProps: commonIncomeProps as TransactionTransferUpdateProps,
      expenseProps: commonExpenseProps as TransactionTransferUpdateProps,
    };
  }
}

const tmpCategoryCommon = { type: CATEGORY_TYPE_SYSTEM, name: TRANSFER_CATEGORY_NAME };
const categoryWithIdObj = { ...tmpCategoryCommon, _id: TRANSFER_CATEGORY_ID_OBJ };
const categoryWithIdStr = { ...tmpCategoryCommon, id: TRANSFER_CATEGORY_ID_STR };
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

export const getTransferTransactionResultJSON = () => {
  const { expenseProps, incomeProps } = getTransferTransactionProps(true);
  const commonJSON = {
    date: DATE_ISO_STR,
    categoryId: { ...categoryWithIdObj },
    paymentMethodId: { ...paymentMethodWithIdObj },
  };
  const expenseTransactionJSON = {
    ...expenseProps,
    ...commonJSON, // order of unpacking dict is important due to overwriting `categoryId`
    _id: TRANSFER_TXN_EXPENSE_ID_OBJ,
    refId: TRANSFER_TXN_INCOME_ID_OBJ,
  };
  const incomeTransactionJSON = {
    ...incomeProps,
    ...commonJSON, // order of unpacking dict is important due to overwriting `categoryId`
    _id: TRANSFER_TXN_INCOME_ID_OBJ,
    refId: TRANSFER_TXN_EXPENSE_ID_OBJ,
  };
  return { expenseTransactionJSON, incomeTransactionJSON };
};

export const getTransferTransactionNotPopulatedResultJSON = () => {
  const { expenseTransactionJSON, incomeTransactionJSON } =
    getTransferTransactionResultJSON();
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

export const getTransferTransactionResultSerialized = () => {
  const { expenseProps, incomeProps } = getTransferTransactionProps(true);
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
    id: TRANSFER_TXN_EXPENSE_ID_STR,
    refId: TRANSFER_TXN_INCOME_ID_STR,
  };
  const incomeTransactionSerialized = {
    ...incomePropsRest,
    ...commonSerialized,
    id: TRANSFER_TXN_INCOME_ID_STR,
    redId: TRANSFER_TXN_EXPENSE_ID_STR,
  };

  return { expenseTransactionSerialized, incomeTransactionSerialized };
};
