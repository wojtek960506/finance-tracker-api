import { FilterQuery, Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { ValidationError } from "@utils/errors";
import { randomObjectIdString } from "@utils/random";
import { getStatisticsMatching } from "./get-statistics-matching";
import { TransactionStatisticsQuery } from "@schemas/transaction-query";


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
  const [TRANSACTION_TYPE, CURRENCY] = ["expense", "PLN"];
  const USER_ID = randomObjectIdString();
  const COMMON_QUERY_PROPS = { transactionType: TRANSACTION_TYPE, currency: CURRENCY };

  it.each([
    ['year and no month', 2025, undefined, '2025/01/01', '2026/01/01'],
    ['year and month (not last)', 2025, 9, '2025/09/01', '2025/10/01'],
    ['year and no month (last)', 2025, 12, '2025/12/01', '2026/01/01'],
  ])("%s", (_title, year, month, startDate, endDate) => {
    const query: TransactionStatisticsQuery = { ...COMMON_QUERY_PROPS, year, month };

    const result = getStatisticsMatching(query, USER_ID);

    expect(result.date).toEqual({
      $gte: new Date(startDate),
      $lt: new Date(endDate),
    })
    checkRequiredProps(result, USER_ID, TRANSACTION_TYPE, CURRENCY);
  })

  it('no year and month', () => {
    const MONTH = 5;
    const query: TransactionStatisticsQuery = { ...COMMON_QUERY_PROPS, month: MONTH }

    const result = getStatisticsMatching(query, USER_ID);

    expect(result.$expr).toEqual({ $eq: [{ $month: "$date" }, MONTH] });
    checkRequiredProps(result, USER_ID, TRANSACTION_TYPE, CURRENCY);
  });

  it("throws error when 'category' and 'excludeCategories' provided together", () => {
    const query: TransactionStatisticsQuery = {
      ...COMMON_QUERY_PROPS,
      category: "food",
      excludeCategories: ["myAccount", "investments"],
    }

    expect(() => getStatisticsMatching(query, USER_ID)).toThrow(ValidationError);
  })

  it("category and no excluded categories", () => {
    const CATEGORY = "food";
    const query: TransactionStatisticsQuery = {
      ...COMMON_QUERY_PROPS,
      category: CATEGORY,
    }

    const result = getStatisticsMatching(query, USER_ID);
    checkRequiredProps(result, USER_ID, TRANSACTION_TYPE, CURRENCY);
    expect(result.category).toEqual(CATEGORY);
  })

  it("no category and excluded categories", () => {
    const EXCLUDED_CATEGORIES = ["food", "transport"];
    const query: TransactionStatisticsQuery = {
      ...COMMON_QUERY_PROPS,
      excludeCategories: EXCLUDED_CATEGORIES,
    }

    const result = getStatisticsMatching(query, USER_ID);
    checkRequiredProps(result, USER_ID, TRANSACTION_TYPE, CURRENCY);
    expect(result.category).toEqual({ $nin: EXCLUDED_CATEGORIES });
  })

  it("has 'account' and 'paymentMethod'", () => {
    const ACCOUNT = "mBank";
    const PAYMENT_METHOD = "card";
    const query: TransactionStatisticsQuery = {
      ...COMMON_QUERY_PROPS,
      account: ACCOUNT,
      paymentMethod: PAYMENT_METHOD
    }

    const result = getStatisticsMatching(query, USER_ID);
    checkRequiredProps(result, USER_ID, TRANSACTION_TYPE, CURRENCY);
    expect(result.account).toEqual(ACCOUNT);
    expect(result.paymentMethod).toEqual(PAYMENT_METHOD);
  })


})