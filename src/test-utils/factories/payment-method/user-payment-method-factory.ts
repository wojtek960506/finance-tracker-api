import { PaymentMethodType } from "@payment-method/model";
import { USER_ID_OBJ, USER_ID_STR } from "@/test-utils/factories/general";
import {
  PAYMENT_METHOD_CASH_NAME,
  PAYMENT_METHOD_TYPE_USER,
  CASH_PAYMENT_METHOD_ID_OBJ,
  CASH_PAYMENT_METHOD_ID_STR,
} from "./payment-method-consts";


const commonProps = {
  type: PAYMENT_METHOD_TYPE_USER as PaymentMethodType,
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

