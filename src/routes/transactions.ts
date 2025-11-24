import { FastifyInstance } from "fastify";
import { TransactionModel } from "@models/transaction-model";
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
import { AuthenticatedRequest, DeleteManyReply, ParamsJustId } from "./types";
import { updateTransactionHelper } from "@utils/routes";
import { validateBody } from "@utils/validation";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { authorizeAccessToken } from "@utils/authorization";
import { checkOwner, findTransaction } from "./utils-routes";


export async function transactionRoutes(app: FastifyInstance) {
  app.get<{ Reply: TransactionsResponseDTO }>(
    "/",
    { preHandler: authorizeAccessToken() },
    async (req) => {
      const transactions = await TransactionModel.find(
        { ownerId: (req as AuthenticatedRequest).userId }
      ).sort({ date: -1 });
      return transactions.map(transaction => serializeTransaction(transaction))
    }
  );

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
    (req) => updateTransactionHelper(req)
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
    (req) => updateTransactionHelper(req)
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
