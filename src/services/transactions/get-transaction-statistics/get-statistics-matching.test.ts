import { FilterQuery, Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { ValidationError } from "@utils/errors";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { getStatisticsMatching } from "./get-statistics-matching";
import { TransactionStatisticsQuery } from "@schemas/transaction-query";
import {
  FOOD_CATEGORY_ID_OBJ,
  FOOD_CATEGORY_ID_STR,
  EXCHANGE_CATEGORY_ID_OBJ,
  EXCHANGE_CATEGORY_ID_STR,
  TRANSFER_CATEGORY_ID_STR,
} from "@/test-utils/factories/category";
import {
  PAYMENT_METHOD,
  ACCOUNT_EXPENSE,
  CURRENCY_EXPENSE,
  TRANSACTION_TYPE_EXPENSE,
} from "@/test-utils/factories/transaction";


const checkRequiredProps = (
  result: FilterQuery<unknown>,
  ownerId: string,
  transactionType: string,
  currency: string
) => {
  expect(result.transactionType).toEqual(transactionType);
  expect(result.currency).toEqual(currency);
  expect(result.ownerId).toEqual(new Types.ObjectId(ownerId));
}

describe('getStatisticsMatching', () => {
  const COMMON_QUERY_PROPS = {
    transactionType: TRANSACTION_TYPE_EXPENSE,
    currency: CURRENCY_EXPENSE
  };

  it.each([
    ['year and no month', 2025, undefined, '2025/01/01', '2026/01/01'],
    ['year and month (not last)', 2025, 9, '2025/09/01', '2025/10/01'],
    ['year and no month (last)', 2025, 12, '2025/12/01', '2026/01/01'],
  ])("%s", (_title, year, month, startDate, endDate) => {
    const query: TransactionStatisticsQuery = { ...COMMON_QUERY_PROPS, year, month };

    const result = getStatisticsMatching(query, USER_ID_STR);

    expect(result.date).toEqual({
      $gte: new Date(startDate),
      $lt: new Date(endDate),
    })
    checkRequiredProps(result, USER_ID_STR, TRANSACTION_TYPE_EXPENSE, CURRENCY_EXPENSE);
  });

  it('no year and month', () => {
    const month = 5;
    const query: TransactionStatisticsQuery = { ...COMMON_QUERY_PROPS, month }

    const result = getStatisticsMatching(query, USER_ID_STR);

    expect(result.$expr).toEqual({ $eq: [{ $month: "$date" }, month] });
    checkRequiredProps(result, USER_ID_STR, TRANSACTION_TYPE_EXPENSE, CURRENCY_EXPENSE);
  });

  it("throws error when 'category' and 'excludeCategories' provided together", () => {
    const query: TransactionStatisticsQuery = {
      ...COMMON_QUERY_PROPS,
      categoryId: FOOD_CATEGORY_ID_STR,
      excludeCategoryIds: [TRANSFER_CATEGORY_ID_STR, EXCHANGE_CATEGORY_ID_STR],
    }

    expect(() => getStatisticsMatching(query, USER_ID_STR)).toThrow(ValidationError);
  });

  it("category and no excluded categories", () => {
    
    const query: TransactionStatisticsQuery = {
      ...COMMON_QUERY_PROPS,
      categoryId: FOOD_CATEGORY_ID_STR,
    }

    const result = getStatisticsMatching(query, USER_ID_STR);
    checkRequiredProps(result, USER_ID_STR, TRANSACTION_TYPE_EXPENSE, CURRENCY_EXPENSE);
    expect(result.categoryId).toEqual(FOOD_CATEGORY_ID_OBJ);
  });

  it("no category and excluded categories", () => {
    const query: TransactionStatisticsQuery = {
      ...COMMON_QUERY_PROPS,
      excludeCategoryIds: [FOOD_CATEGORY_ID_STR, EXCHANGE_CATEGORY_ID_STR],
    }

    const result = getStatisticsMatching(query, USER_ID_STR);
    checkRequiredProps(result, USER_ID_STR, TRANSACTION_TYPE_EXPENSE, CURRENCY_EXPENSE);
    expect(result.categoryId).toEqual({ $nin: [FOOD_CATEGORY_ID_OBJ, EXCHANGE_CATEGORY_ID_OBJ] });
  });

  it("has 'account' and 'paymentMethod'", () => {
    const query: TransactionStatisticsQuery = {
      ...COMMON_QUERY_PROPS,
      account: ACCOUNT_EXPENSE,
      paymentMethod: PAYMENT_METHOD
    }

    const result = getStatisticsMatching(query, USER_ID_STR);
    checkRequiredProps(result, USER_ID_STR, TRANSACTION_TYPE_EXPENSE, CURRENCY_EXPENSE);
    expect(result.account).toEqual(ACCOUNT_EXPENSE);
    expect(result.paymentMethod).toEqual(PAYMENT_METHOD);
  });
})