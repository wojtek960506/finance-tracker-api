import { FastifyInstance } from "fastify";
import { validateBody } from "@utils/validation";
import { authorizeAccessToken } from "@services/auth";
import { findTransactionOld } from "@routes/routes-utils";
import { TransactionModel } from "@models/transaction-model";
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
  TransactionsResponseDTO,
  TransactionCreateStandardDTO,
  TransactionCreateExchangeDTO,
  TransactionCreateTransferDTO,
  TransactionUpdateStandardDTO,
  TransactionUpdateTransferDTO,
  TransactionUpdateExchangeDTO,
  TransactionCreateStandardSchema,
  TransactionCreateExchangeSchema,
  TransactionCreateTransferSchema,
  TransactionUpdateStandardSchema,
  TransactionUpdateTransferSchema,
  TransactionUpdateExchangeSchema,
} from "@schemas/transaction";
import {
  ParamsJustId,
  DeleteManyReply,
  FilteredResponse,
} from "@routes/routes-types";


export async function transactionRoutes(
  app: FastifyInstance & { withTypeProvider: <T>() => any }
) {

  app.get<{ Reply: FilteredResponse<TransactionsResponseDTO> }>(
    "/",
    { preHandler: authorizeAccessToken() },
    getTransactionsHandler
  );

  app.get<{ Reply: TransactionTotalsResponse }>(
    "/totals",
    { preHandler: authorizeAccessToken() },
    getTransactionTotalsHandler
  )

  app.get(
    "/export",
    { preHandler: authorizeAccessToken() },
    exportTransacionsHandler
  )

  // it is possible to group by
  // - just month (then we get all time statistics for month and grouped by a year)
  // - just year (then we get all statistics from given year and grouped by month in a given year)
  // - year and month - then we get all statistics from a given month of the given year
  // additionally we can filter it by category or payment method or account
  app.get<{ Reply: TransactionStatisticsResponse }>(
    "/statistics",
    { preHandler: authorizeAccessToken() },
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
  app.post<{ Body: TransactionCreateStandardDTO; Reply: TransactionResponseDTO }>(
    "/standard",
    {
      preHandler: [
        validateBody(TransactionCreateStandardSchema),
        authorizeAccessToken(),
      ]
    },
    createTransactionHandler
  );

  // create exchange transactions - one expense and one income
  app.post<{
    Body: TransactionCreateExchangeDTO,
    Reply: [TransactionResponseDTO, TransactionResponseDTO]
  }>(
    "/exchange",
    {
      preHandler: [
        validateBody(TransactionCreateExchangeSchema),
        authorizeAccessToken(),
      ]
    },
    createTransactionHandler
  );

  // create transfer transactions - one expense and one income
  app.post<{
    Body: TransactionCreateTransferDTO,
    Reply: [TransactionResponseDTO, TransactionResponseDTO]
  }>(
    "/transfer",
    {
      preHandler: [
        validateBody(TransactionCreateTransferSchema),
        authorizeAccessToken(),
      ]
    },
    createTransactionHandler
  );

  app.put<{ 
    Params: ParamsJustId;
    Body: TransactionUpdateStandardDTO;
    Reply: TransactionResponseDTO
  }>(
    "/standard/:id",
    {
      preHandler: [
        validateBody(TransactionUpdateStandardSchema),
        authorizeAccessToken(),
      ]
    },
    updateTransactionHandler
  );

  app.put<{ 
    Params: ParamsJustId;
    Body: TransactionUpdateTransferDTO;
    Reply: [TransactionResponseDTO, TransactionResponseDTO]
  }>(
    "/transfer/:id",
    {
      preHandler: [
        validateBody(TransactionUpdateTransferSchema),
        authorizeAccessToken(),
      ]
    },
    updateTransactionHandler
  );

  app.put<{ 
    Params: ParamsJustId;
    Body: TransactionUpdateExchangeDTO;
    Reply: [TransactionResponseDTO, TransactionResponseDTO]
  }>(
    "/exchange/:id",
    {
      preHandler: [
        validateBody(TransactionUpdateExchangeSchema),
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
