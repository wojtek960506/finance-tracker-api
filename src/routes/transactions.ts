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
import { NotFoundError } from "@utils/errors";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { authorizeAccessToken } from "@utils/authorization";


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
    async (req, res) => {
      const { id } = req.params;
      const transaction = await TransactionModel.findById(id);
      if (!transaction)
        throw new NotFoundError(`Transaction with ID '${id}' not found`);

      return serializeTransaction(transaction);
    }
  )

  app.post<{ Body: TransactionCreateDTO; Reply: TransactionResponseDTO }>(
    "/",
    { preHandler: [
      validateBody(TransactionCreateSchema),
      authorizeAccessToken(),
    ]},
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
    { preHandler: validateBody(TransactionUpdateSchema) },
    (req, res) => updateTransactionHelper(req, res, true)
  );

  app.patch<{
    Params: ParamsJustId;
    Body: TransactionPatchDTO;
    Reply: TransactionResponseDTO
  }>(
    "/:id",
    { preHandler: validateBody(TransactionPatchSchema) },
    (req, res) => updateTransactionHelper(req, res, false)
  );

  app.delete<{
    Params: ParamsJustId,
    Reply: TransactionResponseDTO
  }>(
    "/:id",
    async (req, res) => {
      const { id } = req.params;
      const deleted = await TransactionModel.findByIdAndDelete(id, { new: true });
      if (!deleted)
        throw new NotFoundError(`Transaction with ID '${id}' not found`);
      
      return res.send(serializeTransaction(deleted));
    }
  )

  app.delete<{ Reply: DeleteManyReply }>("/", async (req, res) => {
    const tmp = await TransactionModel.deleteMany();
    return res.send(tmp);
  })
}
