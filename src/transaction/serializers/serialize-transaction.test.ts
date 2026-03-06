import { describe, expect, it } from "vitest";
import { CategoryType } from "@category/model";
import { PaymentMethodType } from "@payment-method/model";
import { serializeTransaction } from "@transaction/serializers";
import {
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
  getStandardTransactionNotPopulatedResultJSON,
} from "@/test-utils/factories/transaction";
import {
  FOOD_CATEGORY_NAME,
  CATEGORY_TYPE_USER,
  FOOD_CATEGORY_ID_STR,
} from "@/test-utils/factories/category";
import {
  PAYMENT_METHOD_TYPE_SYSTEM,
  PAYMENT_METHOD_BANK_TRANSFER_NAME,
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR,  
} from "@/test-utils/factories/payment-method";


describe("serializeTransaction", () => {
  const transaction = getStandardTransactionResultJSON()
  const iTransaction = {
    ...transaction,
    toObject: () => ({ ...transaction, __v: 1 })
  }
  const transactionSerialized = getStandardTransactionResultSerialized();

  const transactionNotPopulated = getStandardTransactionNotPopulatedResultJSON();
  const iTransactionNotPopulated = {
    ...transactionNotPopulated,
    toObject: () => ({ ...transactionNotPopulated, __v: 2 })
  }
  const categoriesMap = {
    [FOOD_CATEGORY_ID_STR]: {
      id: FOOD_CATEGORY_ID_STR,
      type: CATEGORY_TYPE_USER as CategoryType,
      name: FOOD_CATEGORY_NAME,
    }
  }
  const paymentMethodsMap = {
    [BANK_TRANSFER_PAYMENT_METHOD_ID_STR]: {
      id: BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
      type: PAYMENT_METHOD_TYPE_SYSTEM as PaymentMethodType,
      name: PAYMENT_METHOD_BANK_TRANSFER_NAME,
    }
  };

  it("serialize transaction with populated category", () => {
    const result = serializeTransaction(iTransaction as any);
    expect(result).toEqual(transactionSerialized);
  });

  it("serialize transaction without populated category", () => {
    const result = serializeTransaction(
      iTransactionNotPopulated as any,
      categoriesMap,
      paymentMethodsMap,
    );
    expect(result).toEqual(transactionSerialized);
  });
});
