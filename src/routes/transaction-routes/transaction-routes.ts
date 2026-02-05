import { FastifyInstance } from "fastify";
import { authorizeAccessToken } from "@services/auth";
import { validateBody, validateQuery } from "@utils/validation";
import { TransactionStatisticsResponse, TransactionTotalsResponse } from "./types";
import {
  getTransactionHandler,
  getTransactionsHandler,
  deleteTransactionHandler,
  exportTransacionsHandler,
  createTransactionHandler,
  updateTransactionHandler,
  getTransactionTotalsHandler,
  deleteAllTransactionsHandler,
  createTestTransactionsHandler,
  getTransactionStatisticsHandler,
} from "./handlers";
import {
  TransactionResponseDTO,
  TransactionStandardDTO,
  TransactionExchangeDTO,
  TransactionTransferDTO,
  TransactionsResponseDTO,
  TransactionStandardSchema,
  TransactionExchangeSchema,
  TransactionTransferSchema,
} from "@schemas/transaction";
import {
  ParamsJustId,
  DeleteManyReply,
  FilteredResponse,
} from "@routes/routes-types";
import {
  TransactionQuery,
  TransactionQuerySchema,
  TransactionFiltersQuery,
  TransactionStatisticsQuery,
  TransactionFiltersQuerySchema,
  TransactionStatisticsQuerySchema,
} from "@schemas/transaction-query";


export async function transactionRoutes(
  app: FastifyInstance & { withTypeProvider: <T>() => any }
) {

  app.get<{ 
    Querystring: TransactionQuery,
    Reply: FilteredResponse<TransactionsResponseDTO>,
  }>(
    "/",
    { preHandler: [validateQuery(TransactionQuerySchema), authorizeAccessToken()] },
    getTransactionsHandler,
  );

  app.get(
    "/export",
    { preHandler: authorizeAccessToken() },
    exportTransacionsHandler,
  )

  app.get<{
    Querystring: TransactionFiltersQuery,
    Reply: TransactionTotalsResponse,
  }>(
    "/totals",
    { preHandler: [validateQuery(TransactionFiltersQuerySchema), authorizeAccessToken()] },
    getTransactionTotalsHandler,
  )

  app.get<{
    Querystring: TransactionStatisticsQuery,
    Reply: TransactionStatisticsResponse,
  }>(
    "/statistics",
    { preHandler: [validateQuery(TransactionStatisticsQuerySchema), authorizeAccessToken()] },
    getTransactionStatisticsHandler,
  )

  app.get<{ Params: ParamsJustId; Reply: TransactionResponseDTO }>(
    "/:id",
    { preHandler: authorizeAccessToken() },
    getTransactionHandler,
  )

  app.post<{ Body: TransactionStandardDTO, Reply: TransactionResponseDTO }>(
    "/standard",
    { preHandler: [validateBody(TransactionStandardSchema), authorizeAccessToken()] },
    createTransactionHandler,
  );

  app.post<{
    Body: TransactionExchangeDTO,
    Reply: [TransactionResponseDTO, TransactionResponseDTO],
  }>(
    "/exchange",
    { preHandler: [validateBody(TransactionExchangeSchema), authorizeAccessToken()] },
    createTransactionHandler,
  );

  app.post<{
    Body: TransactionTransferDTO,
    Reply: [TransactionResponseDTO, TransactionResponseDTO],
  }>(
    "/transfer",
    { preHandler: [validateBody(TransactionTransferSchema), authorizeAccessToken()] },
    createTransactionHandler,
  );

  app.put<{ 
    Params: ParamsJustId,
    Body: TransactionStandardDTO,
    Reply: TransactionResponseDTO,
  }>(
    "/standard/:id",
    { preHandler: [validateBody(TransactionStandardSchema), authorizeAccessToken()] },
    updateTransactionHandler,
  );

  app.put<{ 
    Params: ParamsJustId,
    Body: TransactionTransferDTO,
    Reply: [TransactionResponseDTO, TransactionResponseDTO],
  }>(
    "/transfer/:id",
    { preHandler: [validateBody(TransactionTransferSchema), authorizeAccessToken()] },
    updateTransactionHandler,
  );

  app.put<{ 
    Params: ParamsJustId,
    Body: TransactionExchangeDTO,
    Reply: [TransactionResponseDTO, TransactionResponseDTO],
  }>(
    "/exchange/:id",
    { preHandler: [validateBody(TransactionExchangeSchema), authorizeAccessToken()] },
    updateTransactionHandler,
  );

  app.delete<{ Params: ParamsJustId, Reply: DeleteManyReply }>(
    "/:id",
    { preHandler: authorizeAccessToken() },
    deleteTransactionHandler,
  )

  // delete all transactions of an authenticated user
  app.delete<{ Reply: DeleteManyReply }>(
    "/",
    { preHandler: authorizeAccessToken() }, 
    deleteAllTransactionsHandler,
  )

  // create test transactions for authenticated user (only when it has no transactions)
  app.post<{ Reply: { insertedCount: number }}>(
    "/test",
    { preHandler: authorizeAccessToken() },
    createTestTransactionsHandler,
  )
}
