import { FastifyInstance } from "fastify";
import { authorizeAccessToken } from "@services/auth";
import { findTransactionOld } from "@routes/routes-utils";
import { TransactionModel } from "@models/transaction-model";
import { validateBody, validateQuery } from "@utils/validation";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { TransactionStatisticsResponse, TransactionTotalsResponse } from "./types";
import {
  getTransactionsHandler,
  deleteTransactionHandler,
  exportTransacionsHandler,
  createTransactionHandler,
  updateTransactionHandler,
  getTransactionTotalsHandler,
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
  TransactionTotalsQuery,
  TransactionStatisticsQuery,
  TransactionTotalsQuerySchema,
  TransactionStatisticsQuerySchema,
} from "@schemas/transaction-query";


export async function transactionRoutes(
  app: FastifyInstance & { withTypeProvider: <T>() => any }
) {

  app.get<{ Reply: FilteredResponse<TransactionsResponseDTO> }>(
    "/",
    { preHandler: authorizeAccessToken() },
    getTransactionsHandler
  );

  app.get(
    "/export",
    { preHandler: authorizeAccessToken() },
    exportTransacionsHandler
  )

  app.get<{
    Querystring: TransactionTotalsQuery,
    Reply: TransactionTotalsResponse
  }>(
    "/totals",
    { 
      preHandler: [
        validateQuery(TransactionTotalsQuerySchema),
        authorizeAccessToken()
      ]
    },
    getTransactionTotalsHandler
  )

  // it is possible to group by
  // - just month (then we get all time statistics for month and grouped by a year)
  // - just year (then we get all statistics from given year and grouped by month in a given year)
  // - year and month - then we get all statistics from a given month of the given year
  // additionally we can filter it by category or payment method or account
  app.get<{
    Querystring: TransactionStatisticsQuery,
    Reply: TransactionStatisticsResponse,
  }>(
    "/statistics",
    { 
      preHandler: [
        validateQuery(TransactionStatisticsQuerySchema),
        authorizeAccessToken(),
      ]
    },
    getTransactionStatisticsHandler
  )

  app.get<{ Params: ParamsJustId; Reply: TransactionResponseDTO }>(
    "/:id",
    async (req) => {
      const transaction = await findTransactionOld(req.params.id);
      return serializeTransaction(transaction);
    }
  )

  // create one standard transaction
  app.post<{ Body: TransactionStandardDTO; Reply: TransactionResponseDTO }>(
    "/standard",
    {
      preHandler: [
        validateBody(TransactionStandardSchema),
        authorizeAccessToken(),
      ]
    },
    createTransactionHandler
  );

  // create exchange transactions - one expense and one income
  app.post<{
    Body: TransactionExchangeDTO,
    Reply: [TransactionResponseDTO, TransactionResponseDTO]
  }>(
    "/exchange",
    {
      preHandler: [
        validateBody(TransactionExchangeSchema),
        authorizeAccessToken(),
      ]
    },
    createTransactionHandler
  );

  // create transfer transactions - one expense and one income
  app.post<{
    Body: TransactionTransferDTO,
    Reply: [TransactionResponseDTO, TransactionResponseDTO]
  }>(
    "/transfer",
    {
      preHandler: [
        validateBody(TransactionTransferSchema),
        authorizeAccessToken(),
      ]
    },
    createTransactionHandler
  );

  app.put<{ 
    Params: ParamsJustId;
    Body: TransactionStandardDTO;
    Reply: TransactionResponseDTO
  }>(
    "/standard/:id",
    {
      preHandler: [
        validateBody(TransactionStandardSchema),
        authorizeAccessToken(),
      ]
    },
    updateTransactionHandler
  );

  app.put<{ 
    Params: ParamsJustId;
    Body: TransactionTransferDTO;
    Reply: [TransactionResponseDTO, TransactionResponseDTO]
  }>(
    "/transfer/:id",
    {
      preHandler: [
        validateBody(TransactionTransferSchema),
        authorizeAccessToken(),
      ]
    },
    updateTransactionHandler
  );

  app.put<{ 
    Params: ParamsJustId;
    Body: TransactionExchangeDTO;
    Reply: [TransactionResponseDTO, TransactionResponseDTO]
  }>(
    "/exchange/:id",
    {
      preHandler: [
        validateBody(TransactionExchangeSchema),
        authorizeAccessToken(),
      ]
    },
    updateTransactionHandler
  );

  app.delete<{
    Params: ParamsJustId,
    Reply: DeleteManyReply
  }>(
    "/:id",
    { preHandler: authorizeAccessToken() },
    deleteTransactionHandler
  )

  app.delete<{ Reply: DeleteManyReply }>("/", async (_req, res) => {
    const tmp = await TransactionModel.deleteMany();
    return res.send(tmp);
  })
}
