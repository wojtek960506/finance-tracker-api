import { Types } from 'mongoose';

import {
  ACCOUNT_EXPENSE_ID_OBJ,
  ACCOUNT_EXPENSE_ID_STR,
  ACCOUNT_EXPENSE_NAME,
  ACCOUNT_INCOME_ID_OBJ,
  ACCOUNT_INCOME_ID_STR,
  ACCOUNT_INCOME_NAME,
} from '@testing/factories/transaction/transaction-consts';
import { randomObjectIdString } from '@utils/random';

export {
  ACCOUNT_EXPENSE_ID_OBJ,
  ACCOUNT_EXPENSE_ID_STR,
  ACCOUNT_EXPENSE_NAME,
  ACCOUNT_INCOME_ID_OBJ,
  ACCOUNT_INCOME_ID_STR,
  ACCOUNT_INCOME_NAME,
};

export const OTHER_ACCOUNT_NAME = 'otherAccount';
export const OTHER_ACCOUNT_ID_STR = randomObjectIdString();
export const OTHER_ACCOUNT_ID_OBJ = new Types.ObjectId(OTHER_ACCOUNT_ID_STR);

export const ACCOUNT_TYPE_SYSTEM = 'system';
export const ACCOUNT_TYPE_USER = 'user';
