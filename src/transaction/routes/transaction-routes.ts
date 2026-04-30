import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import { authorizeAccessToken } from '@auth/services';
import {
  DeleteManyReply,
  DeleteManyReplySchema,
  FilteredResponse,
  ParamsJustId,
  ParamsJustIdSchema,
  UpdateManyReply,
  UpdateManyReplySchema,
} from '@shared/http';
import {
  TestTransactionsCreateDTO,
  TestTransactionsCreateResponse,
  TestTransactionsCreateResponseSchema,
  TestTransactionsCreateSchema,
  TransactionDetailsResponseDTO,
  TransactionDetailsResponseSchema,
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
  TrashedTransactionDetailsResponseDTO,
  TrashedTransactionDetailsResponseSchema,
  TrashedTransactionsResponseDTO,
  TrashedTransactionsResponseSchema,
  TrashTransactionQuery,
  TrashTransactionQuerySchema,
} from '@transaction/schema';
import { validateBody } from '@utils/validation';

import {
  createTestTransactionsHandler,
  createTransactionHandler,
  deleteTransactionHandler,
  deleteTransactionsHandler,
  deleteTrashedTransactionHandler,
  emptyTrashHandler,
  exportTransacionsHandler,
  getTransactionHandler,
  getTransactionsHandler,
  getTransactionStatisticsHandler,
  getTransactionTotalsHandler,
  getTrashedTransactionHandler,
  getTrashedTransactionsHandler,
  restoreTransactionHandler,
  restoreTransactionsHandler,
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
      preHandler: [authorizeAccessToken()],
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

  app.get<{
    Querystring: TrashTransactionQuery;
    Reply: FilteredResponse<TrashedTransactionsResponseDTO>;
  }>(
    '/trash',
    {
      preHandler: [authorizeAccessToken()],
      schema: {
        tags: ['Transactions'],
        summary: 'List trashed transactions',
        description: 'Return paginated trashed transactions for the authenticated user.',
        querystring: TrashTransactionQuerySchema,
        response: {
          200: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPages: z.number(),
            items: TrashedTransactionsResponseSchema,
          }),
        },
      },
    },
    getTrashedTransactionsHandler,
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
      preHandler: [authorizeAccessToken()],
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
      preHandler: [authorizeAccessToken()],
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

  app.get<{ Params: ParamsJustId; Reply: TrashedTransactionDetailsResponseDTO }>(
    '/trash/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Transactions'],
        summary: 'Get trashed transaction by id',
        description: 'Return a single trashed transaction by id.',
        params: ParamsJustIdSchema,
        response: {
          200: TrashedTransactionDetailsResponseSchema,
        },
      },
    },
    getTrashedTransactionHandler,
  );

  app.post<{ Params: ParamsJustId; Reply: UpdateManyReply }>(
    '/trash/:id/restore',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Transactions'],
        summary: 'Restore trashed transaction',
        description:
          'Restore a trashed transaction by id. Linked transaction is restored as well.',
        params: ParamsJustIdSchema,
        response: {
          200: UpdateManyReplySchema,
        },
      },
    },
    restoreTransactionHandler,
  );

  app.post<{ Reply: UpdateManyReply }>(
    '/trash/restore',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Transactions'],
        summary: 'Restore all trashed transactions',
        description: 'Restore all trashed transactions for the authenticated user.',
        response: {
          200: UpdateManyReplySchema,
        },
      },
    },
    restoreTransactionsHandler,
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteManyReply }>(
    '/trash/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Transactions'],
        summary: 'Delete trashed transaction permanently',
        description:
          'Permanently delete a trashed transaction by id. Linked transaction is deleted as well.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteManyReplySchema,
        },
      },
    },
    deleteTrashedTransactionHandler,
  );

  app.delete<{ Reply: DeleteManyReply }>(
    '/trash',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Transactions'],
        summary: 'Empty trash',
        description:
          'Permanently delete all trashed transactions for the authenticated user.',
        response: {
          200: DeleteManyReplySchema,
        },
      },
    },
    emptyTrashHandler,
  );

  app.get<{ Params: ParamsJustId; Reply: TransactionDetailsResponseDTO }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Transactions'],
        summary: 'Get transaction by id',
        description: 'Return a single transaction by id.',
        params: ParamsJustIdSchema,
        response: {
          200: TransactionDetailsResponseSchema,
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

  app.delete<{ Params: ParamsJustId; Reply: UpdateManyReply }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Transactions'],
        summary: 'Delete transaction',
        description: 'Move a transaction to trash by id.',
        params: ParamsJustIdSchema,
        response: {
          200: UpdateManyReplySchema,
        },
      },
    },
    deleteTransactionHandler,
  );

  // move all transactions of an authenticated user to trash
  app.delete<{ Reply: UpdateManyReply }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Transactions'],
        summary: 'Move all transactions to trash',
        description: 'Move all active transactions for the authenticated user to trash.',
        response: {
          200: UpdateManyReplySchema,
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
