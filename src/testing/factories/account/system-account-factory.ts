import { AccountType } from '@account/model';

import {
  ACCOUNT_EXPENSE_ID_OBJ,
  ACCOUNT_EXPENSE_ID_STR,
  ACCOUNT_EXPENSE_NAME,
  ACCOUNT_INCOME_ID_OBJ,
  ACCOUNT_INCOME_ID_STR,
  ACCOUNT_INCOME_NAME,
  ACCOUNT_TYPE_SYSTEM,
} from './account-consts';

const commonProps = {
  type: ACCOUNT_TYPE_SYSTEM as AccountType,
  ownerId: undefined,
};

const propsExpense = {
  name: ACCOUNT_EXPENSE_NAME,
  nameNormalized: ACCOUNT_EXPENSE_NAME.toLowerCase(),
};

const propsIncome = {
  name: ACCOUNT_INCOME_NAME,
  nameNormalized: ACCOUNT_INCOME_NAME.toLowerCase(),
};

export const getSystemExpenseAccountResultJSON = () => ({
  ...commonProps,
  ...propsExpense,
  _id: ACCOUNT_EXPENSE_ID_OBJ,
});

export const getSystemExpenseAccountResultSerialized = () => ({
  ...commonProps,
  ...propsExpense,
  id: ACCOUNT_EXPENSE_ID_STR,
});

export const getSystemIncomeAccountResultJSON = () => ({
  ...commonProps,
  ...propsIncome,
  _id: ACCOUNT_INCOME_ID_OBJ,
});

export const getSystemIncomeAccountResultSerialized = () => ({
  ...commonProps,
  ...propsIncome,
  id: ACCOUNT_INCOME_ID_STR,
});
