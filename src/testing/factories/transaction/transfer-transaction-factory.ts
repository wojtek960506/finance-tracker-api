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
  ACCOUNT_EXPENSE_ID_OBJ,
  ACCOUNT_EXPENSE_ID_STR,
  ACCOUNT_EXPENSE_NAME,
  ACCOUNT_INCOME_ID_OBJ,
  ACCOUNT_INCOME_ID_STR,
  ACCOUNT_INCOME_NAME,
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
    accountIncomeId: ACCOUNT_INCOME_ID_STR,
    accountExpenseId: ACCOUNT_EXPENSE_ID_STR,
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
    description: `${ACCOUNT_EXPENSE_NAME} --> ${ACCOUNT_INCOME_NAME} (${DESCRPTION})`,
  };

  const commonExpenseProps = {
    ...commonProps,
    accountId: ACCOUNT_EXPENSE_ID_STR,
    transactionType: TRANSACTION_TYPE_EXPENSE,
  };

  const commonIncomeProps = {
    ...commonProps,
    accountId: ACCOUNT_INCOME_ID_STR,
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
const accountExpenseWithIdObj = {
  _id: ACCOUNT_EXPENSE_ID_OBJ,
  type: PAYMENT_METHOD_TYPE_SYSTEM,
  name: ACCOUNT_EXPENSE_NAME,
};
const accountIncomeWithIdObj = {
  _id: ACCOUNT_INCOME_ID_OBJ,
  type: PAYMENT_METHOD_TYPE_SYSTEM,
  name: ACCOUNT_INCOME_NAME,
};
const accountExpenseWithIdStr = {
  id: ACCOUNT_EXPENSE_ID_STR,
  type: PAYMENT_METHOD_TYPE_SYSTEM,
  name: ACCOUNT_EXPENSE_NAME,
};
const accountIncomeWithIdStr = {
  id: ACCOUNT_INCOME_ID_STR,
  type: PAYMENT_METHOD_TYPE_SYSTEM,
  name: ACCOUNT_INCOME_NAME,
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
    accountId: { ...accountExpenseWithIdObj },
    _id: TRANSFER_TXN_EXPENSE_ID_OBJ,
    refId: TRANSFER_TXN_INCOME_ID_OBJ,
  };
  const incomeTransactionJSON = {
    ...incomeProps,
    ...commonJSON, // order of unpacking dict is important due to overwriting `categoryId`
    accountId: { ...accountIncomeWithIdObj },
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
      accountId: expenseTransactionJSON.accountId._id,
    },
    incomeTransactionNotPopulatedJSON: {
      ...incomeTransactionJSON,
      categoryId: incomeTransactionJSON.categoryId._id,
      paymentMethodId: incomeTransactionJSON.paymentMethodId._id,
      accountId: incomeTransactionJSON.accountId._id,
    },
  };
};

export const getTransferTransactionResultSerialized = () => {
  const { expenseProps, incomeProps } = getTransferTransactionProps(true);
  const {
    categoryId: _1,
    paymentMethodId: _2,
    accountId: _3,
    ...expensePropsRest
  } = expenseProps;
  const {
    categoryId: _4,
    paymentMethodId: _5,
    accountId: _6,
    ...incomePropsRest
  } = incomeProps;

  const commonSerialized = {
    date: DATE_ISO_STR,
    category: { ...categoryWithIdStr },
    paymentMethod: { ...paymentMethodWithIdStr },
  };

  const expenseTransactionSerialized = {
    ...expensePropsRest,
    ...commonSerialized,
    account: { ...accountExpenseWithIdStr },
    id: TRANSFER_TXN_EXPENSE_ID_STR,
    refId: TRANSFER_TXN_INCOME_ID_STR,
  };
  const incomeTransactionSerialized = {
    ...incomePropsRest,
    ...commonSerialized,
    account: { ...accountIncomeWithIdStr },
    id: TRANSFER_TXN_INCOME_ID_STR,
    redId: TRANSFER_TXN_EXPENSE_ID_STR,
  };

  return { expenseTransactionSerialized, incomeTransactionSerialized };
};
