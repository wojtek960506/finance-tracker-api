import { NamedResourceType } from '@named-resource';

import {
  ACCOUNT_EXPENSE_ID_OBJ,
  ACCOUNT_EXPENSE_ID_STR,
  ACCOUNT_EXPENSE_NAME,
  ACCOUNT_INCOME_ID_OBJ,
  ACCOUNT_INCOME_ID_STR,
  ACCOUNT_INCOME_NAME,
  ACCOUNT_TYPE_SYSTEM,
  OTHER_ACCOUNT_ID_OBJ,
  OTHER_ACCOUNT_ID_STR,
  OTHER_ACCOUNT_NAME,
} from './account-consts';

const commonProps = {
  type: ACCOUNT_TYPE_SYSTEM as NamedResourceType,
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
const propsOther = {
  name: OTHER_ACCOUNT_NAME,
  nameNormalized: OTHER_ACCOUNT_NAME.toLowerCase(),
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
  isFavorite: false,
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
  isFavorite: false,
});

export const getOtherAccountResultJSON = () => ({
  ...commonProps,
  ...propsOther,
  _id: OTHER_ACCOUNT_ID_OBJ,
});

export const getOtherAccountResultSerialized = () => ({
  ...commonProps,
  ...propsOther,
  id: OTHER_ACCOUNT_ID_STR,
  isFavorite: false,
});
