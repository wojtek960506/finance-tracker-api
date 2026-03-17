import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import { authorizeAccessToken } from '@auth/services';
import {
  DeleteManyReply,
  DeleteManyReplySchema,
  FilteredResponse,
  ParamsJustId,
  ParamsJustIdSchema,
} from '@shared/http';
import {
  TestTransactionsCreateDTO,
  TestTransactionsCreateResponse,
  TestTransactionsCreateResponseSchema,
  TestTransactionsCreateSchema,
  TransactionExchangeDTO,
  TransactionExchangeSchema,
  TransactionFiltersQuery,
  TransactionFiltersQuerySchema,
  TransactionQuery,
  TransactionQuerySchema,
  TransactionResponseDTO,
  TransactionResponseSchema,
  TransactionsResponseDTO,
  TransactionsResponseSchema,
  TransactionStandardDTO,
  TransactionStandardSchema,
  TransactionStatisticsQuery,
  TransactionStatisticsQuerySchema,
  TransactionTransferDTO,
  TransactionTransferSchema,
} from '@transaction/schema';
import { validateBody, validateQuery } from '@utils/validation';

import {
  createTestTransactionsHandler,
  createTransactionHandler,
  deleteTransactionHandler,
  deleteTransactionsHandler,
  exportTransacionsHandler,
  getTransactionHandler,
  getTransactionsHandler,
  getTransactionStatisticsHandler,
  getTransactionTotalsHandler,
  updateTransactionHandler,
} from './handlers';
import { TransactionStatisticsResponse, TransactionTotalsResponse } from './types';

export async function transactionRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  const FilteredTransactionsResponseSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    items: TransactionsResponseSchema,
  });

  const ExchangeOrTransferResponseSchema = z.array(TransactionResponseSchema);

  const TransactionSubcategoryTotalsSchema = z.object({
    totalAmount: z.number(),
    totalItems: z.number(),
    averageAmount: z.number(),
    maxAmount: z.number(),
    minAmount: z.number(),
  });

  const TransactionTotalsByCurrencySchema = z.object({
    totalItems: z.number(),
    expense: TransactionSubcategoryTotalsSchema,
    income: TransactionSubcategoryTotalsSchema,
  });

  const TransactionTotalsOverallSchema = z.object({
    totalItems: z.number(),
    expense: z.object({ totalItems: z.number() }),
    income: z.object({ totalItems: z.number() }),
  });

  const TransactionTotalsResponseSchema = z.object({
    byCurrency: z.record(z.string(), TransactionTotalsByCurrencySchema),
    overall: TransactionTotalsOverallSchema,
  });

  const TotalAmountAndItemsSchema = z.object({
    totalAmount: z.number(),
    totalItems: z.number(),
  });

  const TransactionStatisticsResponseSchema = z.union([
    TotalAmountAndItemsSchema,
    z.object({
      allTime: TotalAmountAndItemsSchema,
      monthly: z.record(z.string(), TotalAmountAndItemsSchema),
    }),
    z.object({
      allTime: TotalAmountAndItemsSchema,
      yearly: z.record(z.string(), TotalAmountAndItemsSchema),
    }),
  ]);

  app.get<{
    Querystring: TransactionQuery;
    Reply: FilteredResponse<TransactionsResponseDTO>;
  }>(
    '/',
    {
      preHandler: [validateQuery(TransactionQuerySchema), authorizeAccessToken()],
      schema: {
        tags: ['Transactions'],
        summary: 'List transactions',
        description: 'Return paginated transactions for the authenticated user.',
        querystring: TransactionQuerySchema,
        response: {
          200: FilteredTransactionsResponseSchema,
        },
      },
    },
    getTransactionsHandler,
  );

  app.get(
    '/export',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Transactions'],
        summary: 'Export transactions',
        description: 'Export transactions to CSV.',
        response: {
          200: z.string(),
        },
      },
    },
    exportTransacionsHandler,
  );

  app.get<{
    Querystring: TransactionFiltersQuery;
    Reply: TransactionTotalsResponse;
  }>(
    '/totals',
    {
      preHandler: [validateQuery(TransactionFiltersQuerySchema), authorizeAccessToken()],
      schema: {
        tags: ['Transactions'],
        summary: 'Get transaction totals',
        description: 'Return totals grouped by currency and transaction type.',
        querystring: TransactionFiltersQuerySchema,
        response: {
          200: TransactionTotalsResponseSchema,
        },
      },
    },
    getTransactionTotalsHandler,
  );

  app.get<{
    Querystring: TransactionStatisticsQuery;
    Reply: TransactionStatisticsResponse;
  }>(
    '/statistics',
    {
      preHandler: [
        validateQuery(TransactionStatisticsQuerySchema),
        authorizeAccessToken(),
      ],
      schema: {
        tags: ['Transactions'],
        summary: 'Get transaction statistics',
        description: 'Return statistics grouped by time period.',
        querystring: TransactionStatisticsQuerySchema,
        response: {
          200: TransactionStatisticsResponseSchema,
        },
      },
    },
    getTransactionStatisticsHandler,
  );

  app.get<{ Params: ParamsJustId; Reply: TransactionResponseDTO }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Transactions'],
        summary: 'Get transaction by id',
        description: 'Return a single transaction by id.',
        params: ParamsJustIdSchema,
        response: {
          200: TransactionResponseSchema,
        },
      },
    },
    getTransactionHandler,
  );

  app.post<{ Body: TransactionStandardDTO; Reply: TransactionResponseDTO }>(
    '/standard',
    {
      preHandler: [validateBody(TransactionStandardSchema), authorizeAccessToken()],
      schema: {
        tags: ['Transactions'],
        summary: 'Create standard transaction',
        description: 'Create a standard transaction.',
        body: TransactionStandardSchema,
        response: {
          201: TransactionResponseSchema,
        },
      },
    },
    createTransactionHandler,
  );

  app.post<{
    Body: TransactionExchangeDTO;
    Reply: [TransactionResponseDTO, TransactionResponseDTO];
  }>(
    '/exchange',
    {
      preHandler: [validateBody(TransactionExchangeSchema), authorizeAccessToken()],
      schema: {
        tags: ['Transactions'],
        summary: 'Create exchange transaction',
        description: 'Create an exchange transaction (two linked entries).',
        body: TransactionExchangeSchema,
        response: {
          201: ExchangeOrTransferResponseSchema,
        },
      },
    },
    createTransactionHandler,
  );

  app.post<{
    Body: TransactionTransferDTO;
    Reply: [TransactionResponseDTO, TransactionResponseDTO];
  }>(
    '/transfer',
    {
      preHandler: [validateBody(TransactionTransferSchema), authorizeAccessToken()],
      schema: {
        tags: ['Transactions'],
        summary: 'Create transfer transaction',
        description: 'Create a transfer transaction (two linked entries).',
        body: TransactionTransferSchema,
        response: {
          201: ExchangeOrTransferResponseSchema,
        },
      },
    },
    createTransactionHandler,
  );

  app.put<{
    Params: ParamsJustId;
    Body: TransactionStandardDTO;
    Reply: TransactionResponseDTO;
  }>(
    '/standard/:id',
    {
      preHandler: [validateBody(TransactionStandardSchema), authorizeAccessToken()],
      schema: {
        tags: ['Transactions'],
        summary: 'Update standard transaction',
        description: 'Update a standard transaction by id.',
        params: ParamsJustIdSchema,
        body: TransactionStandardSchema,
        response: {
          200: TransactionResponseSchema,
        },
      },
    },
    updateTransactionHandler,
  );

  app.put<{
    Params: ParamsJustId;
    Body: TransactionTransferDTO;
    Reply: [TransactionResponseDTO, TransactionResponseDTO];
  }>(
    '/transfer/:id',
    {
      preHandler: [validateBody(TransactionTransferSchema), authorizeAccessToken()],
      schema: {
        tags: ['Transactions'],
        summary: 'Update transfer transaction',
        description: 'Update a transfer transaction by id.',
        params: ParamsJustIdSchema,
        body: TransactionTransferSchema,
        response: {
          200: ExchangeOrTransferResponseSchema,
        },
      },
    },
    updateTransactionHandler,
  );

  app.put<{
    Params: ParamsJustId;
    Body: TransactionExchangeDTO;
    Reply: [TransactionResponseDTO, TransactionResponseDTO];
  }>(
    '/exchange/:id',
    {
      preHandler: [validateBody(TransactionExchangeSchema), authorizeAccessToken()],
      schema: {
        tags: ['Transactions'],
        summary: 'Update exchange transaction',
        description: 'Update an exchange transaction by id.',
        params: ParamsJustIdSchema,
        body: TransactionExchangeSchema,
        response: {
          200: ExchangeOrTransferResponseSchema,
        },
      },
    },
    updateTransactionHandler,
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteManyReply }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Transactions'],
        summary: 'Delete transaction',
        description: 'Delete a transaction by id.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteManyReplySchema,
        },
      },
    },
    deleteTransactionHandler,
  );

  // delete all transactions of an authenticated user
  app.delete<{ Reply: DeleteManyReply }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Transactions'],
        summary: 'Delete all transactions',
        description: 'Delete all transactions for the authenticated user.',
        response: {
          200: DeleteManyReplySchema,
        },
      },
    },
    deleteTransactionsHandler,
  );

  // create test transactions for authenticated user (only when it has no transactions)
  app.post<{ Body?: TestTransactionsCreateDTO; Reply: TestTransactionsCreateResponse }>(
    '/test',
    {
      preHandler: [validateBody(TestTransactionsCreateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Transactions'],
        summary: 'Create test transactions',
        description:
          'Create test transactions for the authenticated user (only if none exist).',
        body: TestTransactionsCreateSchema,
        response: {
          201: TestTransactionsCreateResponseSchema,
        },
      },
    },
    createTestTransactionsHandler,
  );
}
