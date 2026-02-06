import { USER_ID_STR } from "@/test-utils/factories/general";
import { TransactionTransferDTO } from "@schemas/transaction";
import {
  TransactionTransferCreateProps,
  TransactionTransferUpdateProps,
} from "@db/transactions";
import {
  CATEGORY_TYPE_SYSTEM,
  TRANSFER_CATEGORY_NAME,
  TRANSFER_CATEGORY_ID_OBJ,
  TRANSFER_CATEGORY_ID_STR,
} from "@/test-utils/factories/category";
import {
  DATE_OBJ,
  DESCRPTION,
  DATE_ISO_STR,
  ACCOUNT_INCOME,
  AMOUNT_EXPENSE,
  PAYMENT_METHOD,
  ACCOUNT_EXPENSE,
  CURRENCY_EXPENSE,
  TRANSACTION_TYPE_INCOME,
  TRANSACTION_TYPE_EXPENSE,
  TRANSFER_TXN_INCOME_ID_OBJ,
  TRANSFER_TXN_INCOME_ID_STR,
  TRANSFER_TXN_EXPENSE_ID_OBJ,
  TRANSFER_TXN_EXPENSE_ID_STR,
  TRANSFER_TXN_INCOME_SRC_IDX,
  TRANSFER_TXN_EXPENSE_SRC_IDX,
} from "@/test-utils/factories/transaction";


export const getTransferTransactionDTO = () => ({
  date: DATE_OBJ,
  amount: AMOUNT_EXPENSE,
  currency: CURRENCY_EXPENSE,
  paymentMethod: PAYMENT_METHOD,
  accountIncome: ACCOUNT_INCOME,
  accountExpense: ACCOUNT_EXPENSE,
  additionalDescription: DESCRPTION,
} as TransactionTransferDTO);

export function getTransferTransactionProps(): {
  incomeProps: TransactionTransferUpdateProps,
  expenseProps: TransactionTransferUpdateProps,
}
export function getTransferTransactionProps(isCreate: true): {
  incomeProps: TransactionTransferCreateProps,
  expenseProps: TransactionTransferCreateProps,
}
export function getTransferTransactionProps(isCreate?: true) {
  const commonProps = {
    date: DATE_OBJ,
    amount: AMOUNT_EXPENSE,
    currency: CURRENCY_EXPENSE,
    paymentMethod: PAYMENT_METHOD,
    categoryId: TRANSFER_CATEGORY_ID_STR,
    description: `${ACCOUNT_EXPENSE} --> ${ACCOUNT_INCOME} (${DESCRPTION})`,
  }

  const commonExpenseProps = {
    ...commonProps,
    account: ACCOUNT_EXPENSE,
    transactionType: TRANSACTION_TYPE_EXPENSE,
  }

  const commonIncomeProps = {
    ...commonProps,
    account: ACCOUNT_INCOME,
    transactionType: TRANSACTION_TYPE_INCOME,
  }

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
    }
  } else {
    return {
      incomeProps: commonIncomeProps as TransactionTransferUpdateProps,
      expenseProps: commonExpenseProps as TransactionTransferUpdateProps,
    }
  }
}

const tmpCategoryCommon = { type: CATEGORY_TYPE_SYSTEM, name: TRANSFER_CATEGORY_NAME }
const categoryWithIdObj = { ...tmpCategoryCommon, _id: TRANSFER_CATEGORY_ID_OBJ }
const categoryWithIdStr = { ...tmpCategoryCommon, id: TRANSFER_CATEGORY_ID_STR }

export const getTransferTransactionResultJSON = () => {
  const { expenseProps, incomeProps } = getTransferTransactionProps(true);
  const commonJSON = { date: DATE_ISO_STR, categoryId: { ...categoryWithIdObj } };
  const expenseTransactionJSON = {
    ...expenseProps,
    ...commonJSON, // order of unpacking dict is important due to overwriting `categoryId`
    _id: TRANSFER_TXN_EXPENSE_ID_OBJ,
    refId: TRANSFER_TXN_INCOME_ID_OBJ,
  }
  const incomeTransactionJSON = {
    ...incomeProps,
    ...commonJSON, // order of unpacking dict is important due to overwriting `categoryId`
    _id: TRANSFER_TXN_INCOME_ID_OBJ,
    refId: TRANSFER_TXN_EXPENSE_ID_OBJ,
  }
  return { expenseTransactionJSON, incomeTransactionJSON }
}

export const getTransferTransactionNotPopulatedResultJSON = () => {
  const { expenseTransactionJSON, incomeTransactionJSON } = getTransferTransactionResultJSON();
  return {
    expenseTransactionNotPopulatedJSON: {
      ...expenseTransactionJSON,
      categoryId: expenseTransactionJSON.categoryId._id,
    },
    incomeTransactionNotPopulatedJSON: {
      ...incomeTransactionJSON,
      categoryId: incomeTransactionJSON.categoryId._id,
    }
  }
}

export const getTransferTransactionResultSerialized = () => {
  const { expenseProps, incomeProps } = getTransferTransactionProps(true);
  const { categoryId: _1, ...expensePropsRest } = expenseProps;
  const { categoryId: _2, ...incomePropsRest } = incomeProps;

  const commonSerialized = { date: DATE_ISO_STR, category: { ...categoryWithIdStr } }

  const expenseTransactionSerialized = {
    ...expensePropsRest,
    ...commonSerialized,
    id: TRANSFER_TXN_EXPENSE_ID_STR,
    refId: TRANSFER_TXN_INCOME_ID_STR,
  }
  const incomeTransactionSerialized = { 
    ...incomePropsRest,
    ...commonSerialized,
    id: TRANSFER_TXN_INCOME_ID_STR,
    redId: TRANSFER_TXN_EXPENSE_ID_STR,
  }

  return { expenseTransactionSerialized, incomeTransactionSerialized }
}
