import { NamedResourceType } from '@shared/named-resource';
import { USER_ID_OBJ, USER_ID_STR } from '@testing/factories/general';

import {
  CASH_PAYMENT_METHOD_ID_OBJ,
  CASH_PAYMENT_METHOD_ID_STR,
  PAYMENT_METHOD_CASH_NAME,
  PAYMENT_METHOD_TYPE_USER,
} from './payment-method-consts';

const commonProps = {
  type: PAYMENT_METHOD_TYPE_USER as NamedResourceType,
  name: PAYMENT_METHOD_CASH_NAME,
  nameNormalized: PAYMENT_METHOD_CASH_NAME.toLowerCase(),
};

export const getUserPaymentMethodProps = () => ({
  ...commonProps,
  ownerId: USER_ID_STR,
});

export const getUpdatePaymentMethodProps = () => ({ name: PAYMENT_METHOD_CASH_NAME });

export const getUserPaymentMethodResultJSON = () => ({
  ...commonProps,
  ownerId: USER_ID_OBJ,
  _id: CASH_PAYMENT_METHOD_ID_OBJ,
});

export const getUserPaymentMethodResultSerialized = () => ({
  ...commonProps,
  ownerId: USER_ID_STR,
  id: CASH_PAYMENT_METHOD_ID_STR,
});
