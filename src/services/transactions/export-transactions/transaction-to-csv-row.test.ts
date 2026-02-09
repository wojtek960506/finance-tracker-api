import { describe, it, expect } from "vitest";
import { transactionToCsvRow } from "./transaction-to-csv-row";
import { DATE_STR, getStandardTransactionProps } from "@/test-utils/factories/transaction";
import { FOOD_CATEGORY_ID_STR, FOOD_CATEGORY_NAME } from "@/test-utils/factories/category";


describe("transactionToCsvRow", () => {

  const { ownerId, categoryId,  ...transaction } = getStandardTransactionProps();
  const categoriesMap = { [FOOD_CATEGORY_ID_STR]: { name: FOOD_CATEGORY_NAME } };

  it("transaction to csv row", () => {
    const result = transactionToCsvRow(
      { ...transaction, categoryId } as any, categoriesMap as any
    );

    expect(result).toEqual({
      ...transaction,
      category: FOOD_CATEGORY_NAME,
      date: DATE_STR,
      currencies: undefined,
      exchangeRate: undefined,
      sourceRefIndex: undefined,
    });
  })
});
