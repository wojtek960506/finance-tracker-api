import {
  CATEGORY_TYPE_USER,
  FOOD_CATEGORY_ID_OBJ,
  FOOD_CATEGORY_ID_STR,
  FOOD_CATEGORY_NAME,
} from '@/test-utils/factories/category';
import {
  DATE_OBJ,
  DATE_STR,
  USER_ID_OBJ,
  USER_ID_STR,
} from '@/test-utils/factories/general';
import {
  BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ,
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  PAYMENT_METHOD_BANK_TRANSFER_NAME,
  PAYMENT_METHOD_TYPE_SYSTEM,
} from '@/test-utils/factories/payment-method';
import {
  ACCOUNT_EXPENSE,
  AMOUNT_EXPENSE,
  CURRENCY_EXPENSE,
  DESCRPTION,
  STANDARD_TXN_ID_OBJ,
  STANDARD_TXN_ID_STR,
  STANDARD_TXN_SRC_IDX,
  TRANSACTION_TYPE_EXPENSE,
} from '@/test-utils/factories/transaction';

export const getStandardTransactionDTO = () => ({
  date: DATE_OBJ,
  amount: AMOUNT_EXPENSE,
  description: DESCRPTION,
  account: ACCOUNT_EXPENSE,
  currency: CURRENCY_EXPENSE,
  categoryId: FOOD_CATEGORY_ID_STR,
  transactionType: TRANSACTION_TYPE_EXPENSE,
  paymentMethodId: BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
});

export const getStandardTransactionProps = () => ({
  ...getStandardTransactionDTO(),
  ownerId: USER_ID_STR,
  sourceIndex: STANDARD_TXN_SRC_IDX,
});

export const getStandardTransactionResultJSON = () => ({
  ...getStandardTransactionProps(),
  date: DATE_STR,
  _id: STANDARD_TXN_ID_OBJ,
  ownerId: USER_ID_OBJ,
  categoryId: {
    _id: FOOD_CATEGORY_ID_OBJ,
    type: CATEGORY_TYPE_USER,
    name: FOOD_CATEGORY_NAME,
  },
  paymentMethodId: {
    _id: BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ,
    type: PAYMENT_METHOD_TYPE_SYSTEM,
    name: PAYMENT_METHOD_BANK_TRANSFER_NAME,
  },
});

export const getStandardTransactionNotPopulatedResultJSON = () => {
  const { categoryId, paymentMethodId, ...props } = getStandardTransactionResultJSON();
  return { ...props, categoryId: categoryId._id, paymentMethodId: paymentMethodId._id };
};

export const getStandardTransactionResultSerialized = () => {
  const { categoryId, paymentMethodId, ...props } = getStandardTransactionProps();

  return {
    ...props,
    date: DATE_STR,
    refId: undefined,
    id: STANDARD_TXN_ID_STR,
    category: {
      id: FOOD_CATEGORY_ID_STR,
      type: CATEGORY_TYPE_USER,
      name: FOOD_CATEGORY_NAME,
    },
    paymentMethod: {
      id: BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
      type: PAYMENT_METHOD_TYPE_SYSTEM,
      name: PAYMENT_METHOD_BANK_TRANSFER_NAME,
    },
  };
};
