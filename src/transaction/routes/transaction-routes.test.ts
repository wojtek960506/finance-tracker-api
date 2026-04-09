import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import * as namedResourceServices from '@named-resource/services';
import {
  FOOD_CATEGORY_ID_OBJ,
  FOOD_CATEGORY_ID_STR,
  FOOD_CATEGORY_NAME,
} from '@testing/factories/category';
import { DATE_ISO_STR, USER_ID_STR } from '@testing/factories/general';
import {
  BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ,
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  PAYMENT_METHOD_BANK_TRANSFER_NAME,
} from '@testing/factories/payment-method';
import {
  ACCOUNT_EXPENSE_ID_OBJ,
  ACCOUNT_EXPENSE_ID_STR,
  ACCOUNT_EXPENSE_NAME,
  getExchangeTransactionDTO,
  getExchangeTransactionResultSerialized,
  getStandardTransactionDTO,
  getStandardTransactionResultSerialized,
  getTransferTransactionDTO,
  getTransferTransactionResultSerialized,
  STANDARD_TXN_ID_STR as T_ID,
} from '@testing/factories/transaction';
import { TEST_USER_TOTAL_TRANSACTIONS } from '@testing/factories/user';
import { getCsvForTransactions } from '@testing/get-csv-for-transactions';
import { streamTransactions } from '@transaction/db';
import * as serviceT from '@transaction/services';

import { transactionRoutes } from './transaction-routes';

async function* mockAsyncCursor<T>(items: T[]) {
  for (const item of items) {
    yield item;
  }
}

const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({ authorizeAccessToken: vi.fn(() => mockPreHandler) }));
vi.mock('@transaction/db', () => ({ streamTransactions: vi.fn() }));
vi.mock('@transaction/model', () => ({ TransactionModel: { deleteMany: vi.fn() } }));

describe('transaction routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(transactionRoutes);
  await registerErrorHandler(app);

  const standardSerialized = getStandardTransactionResultSerialized();
  const standardDTO = getStandardTransactionDTO();
  const exchangeDTO = getExchangeTransactionDTO();
  const transferDTO = getTransferTransactionDTO();
  const exchangeSerialized = getExchangeTransactionResultSerialized();
  const transferSerialized = getTransferTransactionResultSerialized();
  const normalizeTransactionResponse = <T extends { date: string }>(value: T) => {
    const { refId, redId, ...rest } = value as T & {
      refId?: string;
      redId?: string;
    };
    const account = (rest as any).account as {
      id?: string;
      name?: string;
      type?: string;
    };
    const patchedAccount =
      account && (!account.id || !account.name)
        ? {
            ...account,
            id: account.id ?? ACCOUNT_EXPENSE_ID_STR,
            name: account.name ?? ACCOUNT_EXPENSE_NAME,
          }
        : account;
    return {
      ...rest,
      account: patchedAccount,
      date: DATE_ISO_STR,
      ...(refId ? { refId } : {}),
      createdAt: DATE_ISO_STR,
      updatedAt: DATE_ISO_STR,
    };
  };
  const standardResponse = normalizeTransactionResponse(standardSerialized);
  const exchangeResponse = [
    normalizeTransactionResponse(exchangeSerialized.expenseTransactionSerialized),
    normalizeTransactionResponse(exchangeSerialized.incomeTransactionSerialized),
  ];
  const transferResponse = [
    normalizeTransactionResponse(transferSerialized.expenseTransactionSerialized),
    normalizeTransactionResponse(transferSerialized.incomeTransactionSerialized),
  ];
  const filteredTransactionsResult = {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
    items: [standardResponse],
  };
  const updateManyResult = { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  const totalsResult = {
    byCurrency: {
      PLN: {
        totalItems: 2,
        expense: {
          totalAmount: 100,
          totalItems: 1,
          averageAmount: 100,
          maxAmount: 100,
          minAmount: 100,
        },
        income: {
          totalAmount: 200,
          totalItems: 1,
          averageAmount: 200,
          maxAmount: 200,
          minAmount: 200,
        },
      },
    },
    overall: {
      totalItems: 2,
      expense: { totalItems: 1 },
      income: { totalItems: 1 },
    },
  };
  const statisticsResult = {
    allTime: { totalAmount: 300, totalItems: 2 },
    monthly: {
      1: { totalAmount: 100, totalItems: 1 },
    },
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should get transactions - 'GET /'", async () => {
    vi.spyOn(serviceT, 'getTransactions').mockResolvedValue(
      filteredTransactionsResult as any,
    );
    const response = await app.inject({ method: 'GET', url: '/' });
    expect(serviceT.getTransactions).toHaveBeenCalledOnce();
    expect(serviceT.getTransactions).toHaveBeenCalledWith(
      { page: 1, limit: 20, sortBy: 'date', sortOrder: 'desc' },
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(filteredTransactionsResult);
  });

  it("should export transactions - 'GET /export'", async () => {
    vi.spyOn(namedResourceServices, 'prepareNamedResourcesMap')
      .mockResolvedValueOnce({
        [ACCOUNT_EXPENSE_ID_STR]: { name: ACCOUNT_EXPENSE_NAME } as any,
      })
      .mockResolvedValueOnce({
        [FOOD_CATEGORY_ID_STR]: { name: FOOD_CATEGORY_NAME } as any,
      })
      .mockResolvedValueOnce({
        [BANK_TRANSFER_PAYMENT_METHOD_ID_STR]: {
          name: PAYMENT_METHOD_BANK_TRANSFER_NAME,
        } as any,
      });
    (streamTransactions as Mock).mockReturnValue(
      mockAsyncCursor([
        {
          ...standardSerialized,
          date: new Date(standardSerialized.date),
          categoryId: FOOD_CATEGORY_ID_OBJ,
          paymentMethodId: BANK_TRANSFER_PAYMENT_METHOD_ID_OBJ,
          accountId: ACCOUNT_EXPENSE_ID_OBJ,
        },
      ]),
    );

    const response = await app.inject({ method: 'GET', url: '/export' });

    expect(streamTransactions).toHaveBeenCalledOnce();
    expect(streamTransactions).toHaveBeenCalledWith(USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/csv');
    expect(response.headers['content-disposition']).toContain('transactions-backup');
    expect(response.payload).toEqual(
      getCsvForTransactions({
        ...standardSerialized,
        date: standardSerialized.date.slice(0, 10),
      }),
    );
  });

  it.each<
    [
      'totals' | 'statistics',
      'totals' | 'statistics',
      'getTransactionTotals' | 'getTransactionStatistics',
    ]
  >([
    ['totals', 'totals', 'getTransactionTotals'],
    ['statistics', 'statistics', 'getTransactionStatistics'],
  ])("should get %s of transaction - 'GET /%s'", async (kind, _, serviceName) => {
    const mockedResult = kind === 'totals' ? totalsResult : statisticsResult;
    vi.spyOn(serviceT, serviceName).mockResolvedValue(mockedResult as any);
    const query = { transactionType: 'expense', currency: 'PLN' };
    const response = await app.inject({ method: 'GET', url: `/${kind}`, query });
    expect(serviceT[serviceName]).toHaveBeenCalledOnce();
    expect(serviceT[serviceName]).toHaveBeenCalledWith(query, USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockedResult);
  });

  it('should get transaction - `GET /:id`', async () => {
    vi.spyOn(serviceT, 'getTransaction').mockResolvedValue(standardResponse as any);
    const response = await app.inject({ method: 'GET', url: `/${T_ID}` });
    expect(serviceT.getTransaction).toHaveBeenCalledOnce();
    expect(serviceT.getTransaction).toHaveBeenCalledWith(T_ID, USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(standardResponse);
  });

  it.each<
    [
      'standard' | 'exchange' | 'transfer',
      'standard' | 'exchange' | 'transfer',
      (
        | 'createStandardTransaction'
        | 'createExchangeTransaction'
        | 'createTransferTransaction'
      ),
      any,
    ]
  >([
    ['standard', 'standard', 'createStandardTransaction', standardDTO],
    ['exchange', 'exchange', 'createExchangeTransaction', exchangeDTO],
    ['transfer', 'transfer', 'createTransferTransaction', transferDTO],
  ])("should create %s transaction - 'POST /%s'", async (kind, _, serviceName, body) => {
    const mockedResult =
      kind === 'standard'
        ? standardResponse
        : kind === 'exchange'
          ? exchangeResponse
          : transferResponse;
    vi.spyOn(serviceT, serviceName).mockResolvedValue(mockedResult as any);
    const response = await app.inject({ method: 'POST', url: `/${kind}`, body });
    expect(serviceT[serviceName]).toHaveBeenCalledOnce();
    expect(serviceT[serviceName]).toHaveBeenCalledWith(body, USER_ID_STR);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(mockedResult);
  });

  it.each<
    [
      'standard' | 'exchange' | 'transfer',
      'standard' | 'exchange' | 'transfer',
      (
        | 'updateStandardTransaction'
        | 'updateExchangeTransaction'
        | 'updateTransferTransaction'
      ),
      any,
    ]
  >([
    ['standard', 'standard', 'updateStandardTransaction', standardDTO],
    ['exchange', 'exchange', 'updateExchangeTransaction', exchangeDTO],
    ['transfer', 'transfer', 'updateTransferTransaction', transferDTO],
  ])("should update %s transaction - 'PUT /%s'", async (kind, _, serviceName, body) => {
    const mockedResult =
      kind === 'standard'
        ? standardResponse
        : kind === 'exchange'
          ? exchangeResponse
          : transferResponse;
    vi.spyOn(serviceT, serviceName).mockResolvedValue(mockedResult as any);
    const response = await app.inject({ method: 'PUT', url: `/${kind}/${T_ID}`, body });
    expect(serviceT[serviceName]).toHaveBeenCalledOnce();
    expect(serviceT[serviceName]).toHaveBeenCalledWith(T_ID, USER_ID_STR, body);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockedResult);
  });

  it("should delete transaction - 'DELETE /:id'", async () => {
    vi.spyOn(serviceT, 'deleteTransaction').mockResolvedValue(updateManyResult as any);
    const response = await app.inject({ method: 'DELETE', url: `/${T_ID}` });
    expect(serviceT.deleteTransaction).toHaveBeenCalledOnce();
    expect(serviceT.deleteTransaction).toHaveBeenCalledWith(T_ID, USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(updateManyResult);
  });

  it("should delete all transactions of given user - 'DELETE /'", async () => {
    vi.spyOn(serviceT, 'deleteTransactions').mockResolvedValue(updateManyResult as any);
    const response = await app.inject({ method: 'DELETE', url: '/' });
    expect(serviceT.deleteTransactions).toHaveBeenCalledOnce();
    expect(serviceT.deleteTransactions).toHaveBeenCalledWith(USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(updateManyResult);
  });

  it("should create test transactions for a given user - 'POST /test'", async () => {
    const body = { totalTransactions: TEST_USER_TOTAL_TRANSACTIONS };
    vi.spyOn(serviceT, 'createTestTransactions').mockResolvedValue({
      insertedCount: TEST_USER_TOTAL_TRANSACTIONS,
    } as any);
    const response = await app.inject({ method: 'POST', url: '/test', body });
    expect(serviceT.createTestTransactions).toHaveBeenCalledOnce();
    expect(serviceT.createTestTransactions).toHaveBeenCalledWith(
      USER_ID_STR,
      TEST_USER_TOTAL_TRANSACTIONS,
    );
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      insertedCount: TEST_USER_TOTAL_TRANSACTIONS,
    });
  });
});
