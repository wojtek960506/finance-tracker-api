import { NamedResourceType } from '@shared/named-resource';

import {
  BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ,
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  CASH_PAYMENT_METHOD_ID_OBJ,
  CASH_PAYMENT_METHOD_ID_STR,
  PAYMENT_METHOD_BANK_TRANSFER_NAME,
  PAYMENT_METHOD_CASH_NAME,
  PAYMENT_METHOD_TYPE_SYSTEM,
} from './payment-method-consts';

const commonProps = {
  type: PAYMENT_METHOD_TYPE_SYSTEM as NamedResourceType,
  ownerId: undefined,
};

const propsBankTransfer = {
  name: PAYMENT_METHOD_BANK_TRANSFER_NAME,
  nameNormalized: PAYMENT_METHOD_BANK_TRANSFER_NAME.toLowerCase(),
};

const propsCash = {
  name: PAYMENT_METHOD_CASH_NAME,
  nameNormalized: PAYMENT_METHOD_CASH_NAME.toLowerCase(),
};

export const getBankTransferPaymentMethodResultJSON = () => ({
  ...commonProps,
  ...propsBankTransfer,
  _id: BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ,
});

export const getBankTransferPaymentMethodResultSerialized = () => ({
  ...commonProps,
  ...propsBankTransfer,
  id: BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  isFavorite: false,
});

export const getCashPaymentMethodResultJSON = () => ({
  ...commonProps,
  ...propsCash,
  _id: CASH_PAYMENT_METHOD_ID_OBJ,
});

export const getCashPaymentMethodResultSerialized = () => ({
  ...commonProps,
  ...propsCash,
  id: CASH_PAYMENT_METHOD_ID_STR,
  isFavorite: false,
});
