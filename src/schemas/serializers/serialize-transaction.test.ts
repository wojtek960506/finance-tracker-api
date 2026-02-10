import { describe, expect, it } from "vitest";
import { CategoryType } from "@models/category-model";
import { serializeTransaction } from "@schemas/serializers";
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

  it("serialize transaction with populated category", () => {
    const result = serializeTransaction(iTransaction as any);
    expect(result).toEqual(transactionSerialized);
  });

  it("serialize transaction without populated category", () => {
    const result = serializeTransaction(iTransactionNotPopulated as any, categoriesMap);
    expect(result).toEqual(transactionSerialized);
  });
});
