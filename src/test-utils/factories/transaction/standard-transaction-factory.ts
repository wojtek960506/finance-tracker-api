import { USER_ID_OBJ, USER_ID_STR } from "@/test-utils/factories/general";
import {
  CATEGORY_TYPE_USER,
  FOOD_CATEGORY_ID_OBJ,
  FOOD_CATEGORY_ID_STR,
  FOOD_CATEGORY_NAME,
} from "@/test-utils/factories/category";
import {
  DATE_STR,
  DATE_OBJ,
  DESCRPTION,
  AMOUNT_EXPENSE,
  PAYMENT_METHOD,
  ACCOUNT_EXPENSE,
  CURRENCY_EXPENSE,
  STANDARD_TXN_ID_OBJ,
  STANDARD_TXN_ID_STR,
  STANDARD_TXN_SRC_IDX,
  TRANSACTION_TYPE_EXPENSE,  
} from "@/test-utils/factories/transaction";


export const getStandardTransactionDTO = () => ({
  date: DATE_OBJ,
  amount: AMOUNT_EXPENSE,
  description: DESCRPTION,
  account: ACCOUNT_EXPENSE,
  currency: CURRENCY_EXPENSE,
  categoryId: FOOD_CATEGORY_ID_STR,
  paymentMethod: PAYMENT_METHOD,
  transactionType: TRANSACTION_TYPE_EXPENSE,
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
});

export const getStandardTransactionResultSerialized = () => {
  const { categoryId, ...props } = getStandardTransactionProps();

  return {
    ...props,
    date: DATE_STR,
    refId: undefined,
    id: STANDARD_TXN_ID_STR,
    category: {
      id: FOOD_CATEGORY_ID_STR,
      type: CATEGORY_TYPE_USER,
      name: FOOD_CATEGORY_NAME,
    }
  }
};
