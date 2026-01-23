import { describe, expect, it } from "vitest";
import { buildTransactionFilterQuery } from "./build-transaction-query";

const TRANSACTION_TYPE = "expense";
const CURRENCY = "PLN";
const CATEGORY = "food";
const PAYMENT_METHOD = "card";
const ACCOUNT = "mBank";
const START_DATE = new Date("2015-01-01");
const END_DATE = new Date("2025-12-31");
const MIN_AMOUNT = 1.11;
const MAX_AMOUNT = 2.22;


describe("build-transaction-query", () => {
  const notAllFilters = {
    transactionType: TRANSACTION_TYPE,
    currency: CURRENCY,
    category: CATEGORY,
    paymentMethod: PAYMENT_METHOD,
  }
  const allFilters = {
    ...notAllFilters,
    account: ACCOUNT,
    startDate: START_DATE,
    endDate: END_DATE,
    minAmount: MIN_AMOUNT,
    maxAmount: MAX_AMOUNT,
  }
  const USER_ID = "23456789abcdef0123456789";

  it("build query with all filters", () => {
    const query = buildTransactionFilterQuery(allFilters, USER_ID);
    
    expect(query.transactionType).toBe(TRANSACTION_TYPE);
    expect(query.currency).toBe(CURRENCY);
    expect(query.category).toBe(CATEGORY);
    expect(query.paymentMethod).toBe(PAYMENT_METHOD);
    expect(query.account).toBe(ACCOUNT);
    expect(query.amount).toEqual({
      $gte: MIN_AMOUNT,
      $lte: MAX_AMOUNT,
    });
    expect(query.date).toEqual({
      $gte: START_DATE,
      $lte: END_DATE,
    });
  });

  it("build query with some filters", () => {
    const query = buildTransactionFilterQuery(notAllFilters, USER_ID);
    
    expect(query.transactionType).toBe(TRANSACTION_TYPE);
    expect(query.currency).toBe(CURRENCY);
    expect(query.category).toBe(CATEGORY);
    expect(query.paymentMethod).toBe(PAYMENT_METHOD);
    expect(query.account).toBeUndefined();
    expect(query.amount).toBeUndefined();
    expect(query.date).toBeUndefined();
  });
})