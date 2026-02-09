import { describe, expect, it } from "vitest";
import { ValidationError } from "@utils/errors";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { buildTransactionFilterQuery } from "./build-transaction-query";
import { FOOD_CATEGORY_ID_OBJ, FOOD_CATEGORY_ID_STR } from "@/test-utils/factories/category";
import {
  PAYMENT_METHOD,
  ACCOUNT_EXPENSE,
  END_DATE_FILTER,
  CURRENCY_EXPENSE,
  START_DATE_FILTER,
  MIN_AMOUNT_FILTER,
  MAX_AMOUNT_FILTER,
  TRANSACTION_TYPE_EXPENSE,
} from "@/test-utils/factories/transaction";


describe("build-transaction-query", () => {
  const basicFilters = {
    transactionType: TRANSACTION_TYPE_EXPENSE,
    currency: CURRENCY_EXPENSE,
    categoryId: FOOD_CATEGORY_ID_STR,
    paymentMethod: PAYMENT_METHOD,
    account: ACCOUNT_EXPENSE,
  }
  const advancedFilters = {    
    startDate: START_DATE_FILTER,
    endDate: END_DATE_FILTER,
    minAmount: MIN_AMOUNT_FILTER,
    maxAmount: MAX_AMOUNT_FILTER,
    excludeCategoryIds: [FOOD_CATEGORY_ID_STR],
  }
  
  it("build query with basic filters", () => {
    const query = buildTransactionFilterQuery(basicFilters, USER_ID_STR);
    
    expect(query.transactionType).toBe(TRANSACTION_TYPE_EXPENSE);
    expect(query.currency).toBe(CURRENCY_EXPENSE);
    expect(query.paymentMethod).toBe(PAYMENT_METHOD);
    expect(query.account).toBe(ACCOUNT_EXPENSE);
    expect(query.categoryId).toEqual(FOOD_CATEGORY_ID_OBJ);
    expect(query.amount).toBeUndefined();
    expect(query.date).toBeUndefined();
  });

  it("build query with advanced filters", () => {
    const query = buildTransactionFilterQuery(advancedFilters, USER_ID_STR);
    
    expect(query.transactionType).toBeUndefined();
    expect(query.currency).toBeUndefined();
    expect(query.paymentMethod).toBeUndefined();
    expect(query.account).toBeUndefined();

    expect(query.categoryId).toEqual({ $nin: [FOOD_CATEGORY_ID_OBJ] });

    expect(query.amount).toEqual({ $gte: MIN_AMOUNT_FILTER, $lte: MAX_AMOUNT_FILTER });
    expect(query.date).toEqual({ $gte: START_DATE_FILTER, $lte: END_DATE_FILTER });
  });

  it("build just part of advanced filters - startDate", () => {
    const query = buildTransactionFilterQuery({ startDate: START_DATE_FILTER }, USER_ID_STR);
    expect(query.date).toEqual({ $gte: START_DATE_FILTER} );
  })

  it("build just part of advanced filters - endDate", () => {
    const query = buildTransactionFilterQuery({ endDate: END_DATE_FILTER }, USER_ID_STR);
    expect(query.date).toEqual({ $lte: END_DATE_FILTER} );
  })

  it("build just part of advanced filters - minAmount", () => {
    const query = buildTransactionFilterQuery({ minAmount: MIN_AMOUNT_FILTER }, USER_ID_STR);
    expect(query.amount).toEqual({ $gte: MIN_AMOUNT_FILTER} );
  })

  it("build just part of advanced filters - maxAmount", () => {
    const query = buildTransactionFilterQuery({ maxAmount: MAX_AMOUNT_FILTER }, USER_ID_STR);
    expect(query.amount).toEqual({ $lte: MAX_AMOUNT_FILTER } );
  })

  it("throws when 'category' and 'excludeCategories' are provided together", () => {
    const q = { categoryId: FOOD_CATEGORY_ID_STR, excludeCategoryIds: [FOOD_CATEGORY_ID_STR] }
    expect(() => buildTransactionFilterQuery(q, USER_ID_STR)).toThrow(ValidationError);
  })
})