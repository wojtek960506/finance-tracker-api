import { FilterQuery, Types } from 'mongoose';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { getEnv } from '@app/config/env';
import { prepareNamedResourcesMap } from '@named-resource/services';
import { ACCOUNT_EXPENSE_ID_STR, ACCOUNT_EXPENSE_NAME } from '@testing/factories/account';
import {
  OTHER_ACCOUNT_ID_STR,
  OTHER_ACCOUNT_NAME,
} from '@testing/factories/account/account-consts';
import {
  EXCHANGE_CATEGORY_ID_OBJ,
  EXCHANGE_CATEGORY_ID_STR,
  FOOD_CATEGORY_ID_OBJ,
  FOOD_CATEGORY_ID_STR,
  TRANSFER_CATEGORY_ID_STR,
} from '@testing/factories/category';
import { USER_ID_STR } from '@testing/factories/general';
import {
  BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ,
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  CASH_PAYMENT_METHOD_ID_OBJ,
  CASH_PAYMENT_METHOD_ID_STR,
} from '@testing/factories/payment-method';
import {
  ACCOUNT_EXPENSE_ID_OBJ,
  ACCOUNT_INCOME_ID_OBJ,
  ACCOUNT_INCOME_ID_STR,
  CURRENCY_EXPENSE,
  TRANSACTION_TYPE_EXPENSE,
} from '@testing/factories/transaction';
import {
  findTransactionTotalsByCurrency,
  findTransactionTotalsOverall,
} from '@transaction/db';
import { TransactionModel } from '@transaction/model';
import {
  TransactionAccountStatisticsQuery,
  TransactionStatisticsQuery,
} from '@transaction/schema';
import { buildTransactionFilterQuery } from '@transaction/services/build-transaction-query';
import { ValidationError } from '@utils/errors';
import { randomObjectIdString } from '@utils/random';

import { getAccountStatistics } from './get-account-statistics/get-account-statistics';
import { getStatisticsGrouping } from './get-transaction-statistics/get-statistics-grouping';
import { getStatisticsMatching } from './get-transaction-statistics/get-statistics-matching';
import { getTransactionStatistics } from './get-transaction-statistics/get-transaction-statistics';
import { parseStatisticsResult } from './get-transaction-statistics/parse-statistics-result';
import { getTransactionTotals } from './get-transaction-totals/get-transaction-totals';
import {
  PARSED_TOTALS_BY_CURRENCY,
  PARSED_TOTALS_OVERALL,
  TOTALS_BY_CURRENCY,
  TOTALS_OVERALL,
} from './get-transaction-totals/mocks';
import {
  parseTotalsByCurrencyResult,
  parseTotalsOverallResult,
} from './get-transaction-totals/parse-totals-result';

vi.mock('@app/config/env', () => ({
  getEnv: vi.fn(),
}));

vi.mock('@named-resource/services', () => ({
  prepareNamedResourcesMap: vi.fn(),
}));

vi.mock('@transaction/db', () => ({
  findTransactionTotalsOverall: vi.fn(),
  findTransactionTotalsByCurrency: vi.fn(),
}));

vi.mock('@transaction/model', () => ({
  TransactionModel: { aggregate: vi.fn() },
}));

vi.mock('@transaction/services/build-transaction-query', () => ({
  buildTransactionFilterQuery: vi.fn(),
}));

const getCommonGrouping = (_id: unknown) => ({
  _id,
  totalAmount: { $sum: '$amount' },
  totalItems: { $sum: 1 },
});

const checkRequiredProps = (
  result: FilterQuery<unknown>,
  ownerId: string,
  transactionType: string,
  currency: string,
) => {
  expect(result.transactionType).toEqual(transactionType);
  expect(result.currency).toEqual(currency);
  expect(result.ownerId).toEqual(new Types.ObjectId(ownerId));
};

describe('transaction-stats services', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    vi.clearAllMocks();
    global.fetch = originalFetch;
  });

  describe('getTransactionStatistics', () => {
    it('runs aggregate query and parses statistics result', async () => {
      const USER_ID = randomObjectIdString();
      const aggregateResult = [{ totalAmount: 500, totalItems: 20 }];

      (TransactionModel.aggregate as Mock).mockResolvedValue(aggregateResult);
      const query: TransactionStatisticsQuery = {
        year: 2026,
        month: 5,
        currency: 'PLN',
        transactionType: 'expense',
      };

      const result = await getTransactionStatistics(query, USER_ID);

      expect(TransactionModel.aggregate).toHaveBeenCalledOnce();
      expect(result).toEqual({ totalAmount: 500, totalItems: 20 });
    });
  });

  describe('parseStatisticsResult', () => {
    it.each([
      ['undefined', undefined],
      ['empty', []],
    ])("when result is '%s'", (_title, result) => {
      const parsedData = parseStatisticsResult(result, {} as any);
      expect(parsedData).toEqual({ totalAmount: 0, totalItems: 0 });
    });

    it('when year and month is present in filter', () => {
      const data = { totalAmount: 500, totalItems: 20 };
      const result = [data];
      const parsedData = parseStatisticsResult(result, { year: 2000, month: 10 });
      expect(parsedData).toEqual(data);
    });

    it('when year is present and month is not present in filter', () => {
      const result = [
        {
          allTime: [{ totalAmount: 10, totalItems: 5 }],
          monthly: [
            { _id: { month: 1 }, totalAmount: 4, totalItems: 2 },
            { _id: { month: 2 }, totalAmount: 6, totalItems: 3 },
          ],
        },
      ];
      const parsedResult = parseStatisticsResult(result, { year: 2001 });

      expect(parsedResult).toEqual({
        allTime: { totalAmount: 10, totalItems: 5 },
        monthly: {
          1: { totalAmount: 4, totalItems: 2 },
          2: { totalAmount: 6, totalItems: 3 },
        },
      });
    });

    it('when year is not present', () => {
      const result = [
        {
          allTime: [{ totalAmount: 10, totalItems: 5 }],
          yearly: [
            { _id: { year: 2002 }, totalAmount: 4, totalItems: 2 },
            { _id: { year: 2003 }, totalAmount: 6, totalItems: 3 },
          ],
        },
      ];
      const parsedResult = parseStatisticsResult(result, { month: 5 });

      expect(parsedResult).toEqual({
        allTime: { totalAmount: 10, totalItems: 5 },
        yearly: {
          2002: { totalAmount: 4, totalItems: 2 },
          2003: { totalAmount: 6, totalItems: 3 },
        },
      });
    });

    it('when year is present and month is not present and there is no data', () => {
      const result = [{ allTime: [], monthly: [] }];
      const parsedResult = parseStatisticsResult(result, { year: 2004 });

      expect(parsedResult).toEqual({
        allTime: { totalAmount: 0, totalItems: 0 },
        monthly: {},
      });
    });
  });

  describe('getStatisticsGrouping', () => {
    it('group by year and month', () => {
      const query = { year: 2025, month: 5 };
      const result = getStatisticsGrouping(query);
      expect(result).toEqual({ $group: getCommonGrouping(null) });
    });

    it('group by year and not by month', () => {
      const query = { year: 2025 };
      const result = getStatisticsGrouping(query);

      expect(result).toEqual({
        $facet: {
          allTime: [{ $group: getCommonGrouping(null) }],
          monthly: [
            { $group: getCommonGrouping({ month: { $month: '$date' } }) },
            { $sort: { '_id.month': 1 } },
          ],
        },
      });
    });

    it.each([
      ['present', 5],
      ['not present', undefined],
    ])('group when year is not present (month %s)', (_title, month) => {
      const query = { month };
      const result = getStatisticsGrouping(query);

      expect(result).toEqual({
        $facet: {
          allTime: [{ $group: getCommonGrouping(null) }],
          yearly: [
            { $group: getCommonGrouping({ year: { $year: '$date' } }) },
            { $sort: { '_id.year': 1 } },
          ],
        },
      });
    });
  });

  describe('getStatisticsMatching', () => {
    const COMMON_QUERY_PROPS = {
      transactionType: TRANSACTION_TYPE_EXPENSE,
      currency: CURRENCY_EXPENSE,
    };

    it.each([
      ['year and no month', 2025, undefined, '2025/01/01', '2026/01/01'],
      ['year and month (not last)', 2025, 9, '2025/09/01', '2025/10/01'],
      ['year and no month (last)', 2025, 12, '2025/12/01', '2026/01/01'],
    ])('%s', (_title, year, month, startDate, endDate) => {
      const query: TransactionStatisticsQuery = {
        ...COMMON_QUERY_PROPS,
        year,
        month,
      };

      const result = getStatisticsMatching(query, USER_ID_STR);

      expect(result.date).toEqual({
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      });
      checkRequiredProps(result, USER_ID_STR, TRANSACTION_TYPE_EXPENSE, CURRENCY_EXPENSE);
    });

    it('no year and month', () => {
      const month = 5;
      const query: TransactionStatisticsQuery = { ...COMMON_QUERY_PROPS, month };

      const result = getStatisticsMatching(query, USER_ID_STR);

      expect(result.$expr).toEqual({ $eq: [{ $month: '$date' }, month] });
      checkRequiredProps(result, USER_ID_STR, TRANSACTION_TYPE_EXPENSE, CURRENCY_EXPENSE);
    });

    it("throws error when 'categoryIds' and 'excludeCategoryIds' provided together", () => {
      const query: TransactionStatisticsQuery = {
        ...COMMON_QUERY_PROPS,
        categoryIds: [FOOD_CATEGORY_ID_STR],
        excludeCategoryIds: [TRANSFER_CATEGORY_ID_STR, EXCHANGE_CATEGORY_ID_STR],
      };

      expect(() => getStatisticsMatching(query, USER_ID_STR)).toThrow(ValidationError);
    });

    it('category and no excluded categories', () => {
      const query: TransactionStatisticsQuery = {
        ...COMMON_QUERY_PROPS,
        categoryIds: [FOOD_CATEGORY_ID_STR],
      };

      const result = getStatisticsMatching(query, USER_ID_STR);
      checkRequiredProps(result, USER_ID_STR, TRANSACTION_TYPE_EXPENSE, CURRENCY_EXPENSE);
      expect(result.categoryId).toEqual(FOOD_CATEGORY_ID_OBJ);
    });

    it('no category and excluded categories', () => {
      const query: TransactionStatisticsQuery = {
        ...COMMON_QUERY_PROPS,
        excludeCategoryIds: [FOOD_CATEGORY_ID_STR, EXCHANGE_CATEGORY_ID_STR],
      };

      const result = getStatisticsMatching(query, USER_ID_STR);
      checkRequiredProps(result, USER_ID_STR, TRANSACTION_TYPE_EXPENSE, CURRENCY_EXPENSE);
      expect(result.categoryId).toEqual({
        $nin: [FOOD_CATEGORY_ID_OBJ, EXCHANGE_CATEGORY_ID_OBJ],
      });
    });

    it("has 'accountId' and 'paymentMethodId'", () => {
      const query: TransactionStatisticsQuery = {
        ...COMMON_QUERY_PROPS,
        accountIds: [ACCOUNT_EXPENSE_ID_STR],
        paymentMethodIds: [BANK_TRANSFER_PAYMENT_METHOD_ID_STR],
      };

      const result = getStatisticsMatching(query, USER_ID_STR);
      checkRequiredProps(result, USER_ID_STR, TRANSACTION_TYPE_EXPENSE, CURRENCY_EXPENSE);
      expect(result.accountId).toEqual(ACCOUNT_EXPENSE_ID_OBJ);
      expect(result.paymentMethodId).toEqual(BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ);
    });

    it('supports multi-value include filters', () => {
      const query: TransactionStatisticsQuery = {
        ...COMMON_QUERY_PROPS,
        categoryIds: [FOOD_CATEGORY_ID_STR, EXCHANGE_CATEGORY_ID_STR],
        paymentMethodIds: [
          BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
          CASH_PAYMENT_METHOD_ID_STR,
        ],
        accountIds: [ACCOUNT_EXPENSE_ID_STR, ACCOUNT_INCOME_ID_STR],
      };

      const result = getStatisticsMatching(query, USER_ID_STR);

      expect(result.categoryId).toEqual({
        $in: [FOOD_CATEGORY_ID_OBJ, EXCHANGE_CATEGORY_ID_OBJ],
      });
      expect(result.paymentMethodId).toEqual({
        $in: [BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ, CASH_PAYMENT_METHOD_ID_OBJ],
      });
      expect(result.accountId).toEqual({
        $in: [ACCOUNT_EXPENSE_ID_OBJ, ACCOUNT_INCOME_ID_OBJ],
      });
    });

    it('supports multi-value exclude filters', () => {
      const query: TransactionStatisticsQuery = {
        ...COMMON_QUERY_PROPS,
        excludeCategoryIds: [FOOD_CATEGORY_ID_STR, EXCHANGE_CATEGORY_ID_STR],
        excludePaymentMethodIds: [
          BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
          CASH_PAYMENT_METHOD_ID_STR,
        ],
        excludeAccountIds: [ACCOUNT_EXPENSE_ID_STR, ACCOUNT_INCOME_ID_STR],
      };

      const result = getStatisticsMatching(query, USER_ID_STR);

      expect(result.categoryId).toEqual({
        $nin: [FOOD_CATEGORY_ID_OBJ, EXCHANGE_CATEGORY_ID_OBJ],
      });
      expect(result.paymentMethodId).toEqual({
        $nin: [BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ, CASH_PAYMENT_METHOD_ID_OBJ],
      });
      expect(result.accountId).toEqual({
        $nin: [ACCOUNT_EXPENSE_ID_OBJ, ACCOUNT_INCOME_ID_OBJ],
      });
    });

    // prettier-ignore
    it(
      "throws error when 'paymentMethodIds' and 'excludePaymentMethodIds' provided together",
      () => {
      const query: TransactionStatisticsQuery = {
        ...COMMON_QUERY_PROPS,
        paymentMethodIds: [BANK_TRANSFER_PAYMENT_METHOD_ID_STR],
        excludePaymentMethodIds: [CASH_PAYMENT_METHOD_ID_STR],
      };

      expect(() => getStatisticsMatching(query, USER_ID_STR)).toThrow(
        ValidationError,
      );
    });

    it("throws error when 'accountIds' and 'excludeAccountIds' provided together", () => {
      const query: TransactionStatisticsQuery = {
        ...COMMON_QUERY_PROPS,
        accountIds: [ACCOUNT_EXPENSE_ID_STR],
        excludeAccountIds: [ACCOUNT_INCOME_ID_STR],
      };

      expect(() => getStatisticsMatching(query, USER_ID_STR)).toThrow(ValidationError);
    });
  });

  describe('getAccountStatistics', () => {
    // prettier-ignore
    it(
      'gets account statistics grouped by currency and sorted by balance within currency',
      async () => {
      const FILTER = { ownerId: 'owner', deletion: null };
      const query: TransactionAccountStatisticsQuery = {
        transactionType: 'income',
        currency: 'PLN',
      };

      (buildTransactionFilterQuery as Mock).mockReturnValue(FILTER);
      (TransactionModel.aggregate as Mock).mockResolvedValue([
        {
          _id: { accountId: ACCOUNT_EXPENSE_ID_STR, currency: 'USD' },
          totalAmount: 50,
          totalItems: 1,
        },
        {
          _id: { accountId: OTHER_ACCOUNT_ID_STR, currency: 'PLN' },
          totalAmount: 300,
          totalItems: 4,
        },
        {
          _id: { accountId: ACCOUNT_EXPENSE_ID_STR, currency: 'PLN' },
          totalAmount: 200,
          totalItems: 2,
        },
        {
          _id: { accountId: ACCOUNT_EXPENSE_ID_STR, currency: 'CZK' },
          totalAmount: 1.545430450278218e-13,
          totalItems: 273,
        },
      ]);
      (prepareNamedResourcesMap as Mock).mockResolvedValue({
        [ACCOUNT_EXPENSE_ID_STR]: { name: ACCOUNT_EXPENSE_NAME, type: 'user' },
        [OTHER_ACCOUNT_ID_STR]: { name: OTHER_ACCOUNT_NAME, type: 'system' },
      });
      (getEnv as Mock).mockReturnValue({});

      const result = await getAccountStatistics(query, USER_ID_STR);

      expect(buildTransactionFilterQuery).toHaveBeenCalledOnce();
      expect(buildTransactionFilterQuery).toHaveBeenCalledWith(
        query,
        USER_ID_STR,
      );
      expect(TransactionModel.aggregate).toHaveBeenCalledOnce();
      expect(prepareNamedResourcesMap).toHaveBeenCalledOnce();
      expect(prepareNamedResourcesMap).toHaveBeenCalledWith(
        'account',
        USER_ID_STR,
        [ACCOUNT_EXPENSE_ID_STR, OTHER_ACCOUNT_ID_STR],
      );
      expect(result).toEqual({
        currencies: [
          {
            currency: 'CZK',
            totalAmount: 0,
            totalItems: 273,
            accounts: [
              {
                accountId: ACCOUNT_EXPENSE_ID_STR,
                accountName: ACCOUNT_EXPENSE_NAME,
                accountType: 'user',
                totalAmount: 0,
                totalItems: 273,
              },
            ],
          },
          {
            currency: 'PLN',
            totalAmount: 500,
            totalItems: 6,
            accounts: [
              {
                accountId: OTHER_ACCOUNT_ID_STR,
                accountName: OTHER_ACCOUNT_NAME,
                accountType: 'system',
                totalAmount: 300,
                totalItems: 4,
              },
              {
                accountId: ACCOUNT_EXPENSE_ID_STR,
                accountName: ACCOUNT_EXPENSE_NAME,
                accountType: 'user',
                totalAmount: 200,
                totalItems: 2,
              },
            ],
          },
          {
            currency: 'USD',
            totalAmount: 50,
            totalItems: 1,
            accounts: [
              {
                accountId: ACCOUNT_EXPENSE_ID_STR,
                accountName: ACCOUNT_EXPENSE_NAME,
                accountType: 'user',
                totalAmount: 50,
                totalItems: 1,
              },
            ],
          },
        ],
      });
    });

    // prettier-ignore
    it(
      'calculates normalized totals when base currency is valid and rates are available',
      async () => {
      const FILTER = { ownerId: 'owner', deletion: null };
      const query: TransactionAccountStatisticsQuery = {
        baseCurrency: 'PLN',
      };

      (buildTransactionFilterQuery as Mock).mockReturnValue(FILTER);
      (TransactionModel.aggregate as Mock).mockResolvedValue([
        {
          _id: { accountId: ACCOUNT_EXPENSE_ID_STR, currency: 'EUR' },
          totalAmount: 100,
          totalItems: 2,
        },
        {
          _id: { accountId: OTHER_ACCOUNT_ID_STR, currency: 'USD' },
          totalAmount: 50,
          totalItems: 1,
        },
      ]);
      (prepareNamedResourcesMap as Mock).mockResolvedValue({
        [ACCOUNT_EXPENSE_ID_STR]: { name: ACCOUNT_EXPENSE_NAME, type: 'user' },
        [OTHER_ACCOUNT_ID_STR]: { name: OTHER_ACCOUNT_NAME, type: 'system' },
      });
      (getEnv as Mock).mockReturnValue({ currencyFreaksApiKey: 'cf_key' });
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          date: '2026-07-08 00:00:00+00',
          base: 'USD',
          rates: {
            EUR: '0.877116',
            PLN: '3.7731',
          },
        }),
      } as Response);

      const result = await getAccountStatistics(query, USER_ID_STR);

      expect(global.fetch).toHaveBeenCalledOnce();
      expect(result).toEqual({
        normalizedBaseCurrency: 'PLN',
        normalizedTotalAmount: 618.83,
        currencies: [
          {
            currency: 'EUR',
            totalAmount: 100,
            totalItems: 2,
            normalizedTotalAmount: 430.17,
            accounts: [
              {
                accountId: ACCOUNT_EXPENSE_ID_STR,
                accountName: ACCOUNT_EXPENSE_NAME,
                accountType: 'user',
                totalAmount: 100,
                totalItems: 2,
                normalizedTotalAmount: 430.17,
              },
            ],
          },
          {
            currency: 'USD',
            totalAmount: 50,
            totalItems: 1,
            normalizedTotalAmount: 188.66,
            accounts: [
              {
                accountId: OTHER_ACCOUNT_ID_STR,
                accountName: OTHER_ACCOUNT_NAME,
                accountType: 'system',
                totalAmount: 50,
                totalItems: 1,
                normalizedTotalAmount: 188.66,
              },
            ],
          },
        ],
      });
    });
  });

  describe('getTransactionTotals', () => {
    it('get transaction totals', async () => {
      (findTransactionTotalsByCurrency as Mock).mockResolvedValue(TOTALS_BY_CURRENCY);
      (findTransactionTotalsOverall as Mock).mockResolvedValue(TOTALS_OVERALL);

      const result = await getTransactionTotals(
        { categoryIds: [FOOD_CATEGORY_ID_STR] },
        randomObjectIdString(),
      );

      expect(findTransactionTotalsByCurrency).toHaveBeenCalledOnce();
      expect(findTransactionTotalsOverall).toHaveBeenCalledOnce();
      expect(result).toEqual({
        overall: PARSED_TOTALS_OVERALL,
        byCurrency: PARSED_TOTALS_BY_CURRENCY,
      });
    });
  });

  describe('parseTotalsResult', () => {
    it('parseTotalsOverallResult', () => {
      const result = parseTotalsOverallResult(TOTALS_OVERALL);
      expect(result).toEqual(PARSED_TOTALS_OVERALL);
    });

    it('parseTotalsByCurrencyResult', () => {
      const result = parseTotalsByCurrencyResult(TOTALS_BY_CURRENCY);
      expect(result).toEqual(PARSED_TOTALS_BY_CURRENCY);
    });
  });
});
