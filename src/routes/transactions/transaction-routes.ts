import { FastifyInstance } from "fastify";
import { validateBody } from "@utils/validation";
import { TransactionModel } from "@models/transaction-model";
import { checkOwner, findTransaction } from "../utils-routes";
import { authorizeAccessToken } from "@/services/authorization";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { TransactionStatisticsResponse, TransactionTotalsResponse } from "./types";
import {
  getTransactionsHandler,
  updateTransactionHandler,
  getTransactionTotalsHandler,
  getTransactionStatisticsHandler,
} from "./handlers";
import { 
  TransactionCreateDTO,
  TransactionCreateSchema,
  TransactionPatchDTO,
  TransactionPatchSchema,
  TransactionUpdateDTO,
  TransactionUpdateSchema,
  TransactionResponseDTO,
  TransactionsResponseDTO,
} from "@schemas/transaction";
import {
  AuthenticatedRequest,
  DeleteManyReply,
  FilteredResponse,
  ParamsJustId
} from "@routes/types-routes";


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
      const transaction = await findTransaction(req.params.id);
      return serializeTransaction(transaction);
    }
  )

  app.post<{ Body: TransactionCreateDTO; Reply: TransactionResponseDTO }>(
    "/",
    { 
      preHandler: [
        validateBody(TransactionCreateSchema),
        authorizeAccessToken(),
      ]
    },
    async (req, res) => {
      const newTransaction = await TransactionModel.create({
        ...req.body,
        ownerId: (req as AuthenticatedRequest).userId
      })
      res.code(201).send(serializeTransaction(newTransaction));
    }
  );

  app.put<{ 
    Params: ParamsJustId;
    Body: TransactionUpdateDTO;
    Reply: TransactionResponseDTO
  }>(
    "/:id",
    {
      preHandler: [
        validateBody(TransactionUpdateSchema),
        authorizeAccessToken(),
      ]
    },
    updateTransactionHandler
  );

  app.patch<{
    Params: ParamsJustId;
    Body: TransactionPatchDTO;
    Reply: TransactionResponseDTO
  }>(
    "/:id",
    { 
      preHandler: [
        validateBody(TransactionPatchSchema),
        authorizeAccessToken()
      ]
    },
    updateTransactionHandler
  );

  app.delete<{
    Params: ParamsJustId,
    Reply: TransactionResponseDTO
  }>(
    "/:id",
    { preHandler: authorizeAccessToken() },
    async (req) => {
      const { id } = req.params;
      const transaction = await findTransaction(id);
  
      checkOwner((req as AuthenticatedRequest).userId, transaction, "delete");

      await transaction.deleteOne();
      return serializeTransaction(transaction);
    }
  )

  app.delete<{ Reply: DeleteManyReply }>("/", async (_req, res) => {
    const tmp = await TransactionModel.deleteMany();
    return res.send(tmp);
  })
}
