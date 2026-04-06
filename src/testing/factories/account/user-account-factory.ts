import { NamedResourceType } from '@shared/named-resource';
import { USER_ID_OBJ, USER_ID_STR } from '@testing/factories/general';

import {
  ACCOUNT_EXPENSE_ID_OBJ,
  ACCOUNT_EXPENSE_ID_STR,
  ACCOUNT_EXPENSE_NAME,
  ACCOUNT_TYPE_USER,
} from './account-consts';

const commonProps = {
  type: ACCOUNT_TYPE_USER as NamedResourceType,
  name: ACCOUNT_EXPENSE_NAME,
  nameNormalized: ACCOUNT_EXPENSE_NAME.toLowerCase(),
};

export const getUserAccountProps = () => ({
  ...commonProps,
  ownerId: USER_ID_STR,
});

export const getUpdateAccountProps = () => ({ name: ACCOUNT_EXPENSE_NAME });

export const getUserAccountResultJSON = () => ({
  ...commonProps,
  ownerId: USER_ID_OBJ,
  _id: ACCOUNT_EXPENSE_ID_OBJ,
});

export const getUserAccountResultSerialized = () => ({
  ...commonProps,
  ownerId: USER_ID_STR,
  id: ACCOUNT_EXPENSE_ID_STR,
  isFavorite: false,
});
