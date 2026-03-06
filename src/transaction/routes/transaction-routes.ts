import { FastifyInstance } from 'fastify';

import { authorizeAccessToken } from '@auth/services';
import { DeleteManyReply, FilteredResponse, ParamsJustId } from '@shared/http';
import {
  TestTransactionsCreateDTO,
  TestTransactionsCreateResponse,
  TestTransactionsCreateSchema,
  TransactionExchangeDTO,
  TransactionExchangeSchema,
  TransactionFiltersQuery,
  TransactionFiltersQuerySchema,
  TransactionQuery,
  TransactionQuerySchema,
  TransactionResponseDTO,
  TransactionsResponseDTO,
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
  app.get<{
    Querystring: TransactionQuery;
    Reply: FilteredResponse<TransactionsResponseDTO>;
  }>(
    '/',
    { preHandler: [validateQuery(TransactionQuerySchema), authorizeAccessToken()] },
    getTransactionsHandler,
  );

  app.get('/export', { preHandler: authorizeAccessToken() }, exportTransacionsHandler);

  app.get<{
    Querystring: TransactionFiltersQuery;
    Reply: TransactionTotalsResponse;
  }>(
    '/totals',
    {
      preHandler: [validateQuery(TransactionFiltersQuerySchema), authorizeAccessToken()],
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
    },
    getTransactionStatisticsHandler,
  );

  app.get<{ Params: ParamsJustId; Reply: TransactionResponseDTO }>(
    '/:id',
    { preHandler: authorizeAccessToken() },
    getTransactionHandler,
  );

  app.post<{ Body: TransactionStandardDTO; Reply: TransactionResponseDTO }>(
    '/standard',
    { preHandler: [validateBody(TransactionStandardSchema), authorizeAccessToken()] },
    createTransactionHandler,
  );

  app.post<{
    Body: TransactionExchangeDTO;
    Reply: [TransactionResponseDTO, TransactionResponseDTO];
  }>(
    '/exchange',
    { preHandler: [validateBody(TransactionExchangeSchema), authorizeAccessToken()] },
    createTransactionHandler,
  );

  app.post<{
    Body: TransactionTransferDTO;
    Reply: [TransactionResponseDTO, TransactionResponseDTO];
  }>(
    '/transfer',
    { preHandler: [validateBody(TransactionTransferSchema), authorizeAccessToken()] },
    createTransactionHandler,
  );

  app.put<{
    Params: ParamsJustId;
    Body: TransactionStandardDTO;
    Reply: TransactionResponseDTO;
  }>(
    '/standard/:id',
    { preHandler: [validateBody(TransactionStandardSchema), authorizeAccessToken()] },
    updateTransactionHandler,
  );

  app.put<{
    Params: ParamsJustId;
    Body: TransactionTransferDTO;
    Reply: [TransactionResponseDTO, TransactionResponseDTO];
  }>(
    '/transfer/:id',
    { preHandler: [validateBody(TransactionTransferSchema), authorizeAccessToken()] },
    updateTransactionHandler,
  );

  app.put<{
    Params: ParamsJustId;
    Body: TransactionExchangeDTO;
    Reply: [TransactionResponseDTO, TransactionResponseDTO];
  }>(
    '/exchange/:id',
    { preHandler: [validateBody(TransactionExchangeSchema), authorizeAccessToken()] },
    updateTransactionHandler,
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteManyReply }>(
    '/:id',
    { preHandler: authorizeAccessToken() },
    deleteTransactionHandler,
  );

  // delete all transactions of an authenticated user
  app.delete<{ Reply: DeleteManyReply }>(
    '/',
    { preHandler: authorizeAccessToken() },
    deleteTransactionsHandler,
  );

  // create test transactions for authenticated user (only when it has no transactions)
  app.post<{ Body?: TestTransactionsCreateDTO; Reply: TestTransactionsCreateResponse }>(
    '/test',
    { preHandler: [validateBody(TestTransactionsCreateSchema), authorizeAccessToken()] },
    createTestTransactionsHandler,
  );
}
