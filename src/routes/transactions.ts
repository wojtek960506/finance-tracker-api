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
import { AuthenticatedRequest, DeleteManyReply, FilteredResponse, ParamsJustId } from "./types";
import { updateTransactionHelper } from "@utils/routes";
import { validateBody, validateSchema } from "@utils/validation";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { authorizeAccessToken } from "@/services/authorization";
import { checkOwner, findTransaction } from "./utils-routes";
import { transactionQuerySchema } from "@schemas/transaction-query";
import { buildTransactionQuery } from "@/services/build-transaction-query";

export async function transactionRoutes(
  app: FastifyInstance & { withTypeProvider: <T>() => any }
) {

  app.get<{ Reply: FilteredResponse<TransactionsResponseDTO> }>(
    "/",
    { preHandler: authorizeAccessToken() },
    async (req, res) => {
      const q = validateSchema(transactionQuerySchema, req.query);

      const filter = buildTransactionQuery(q, (req as AuthenticatedRequest).userId);
      const skip = (q.page - 1) * q.limit;

      const [transactions, total] = await Promise.all([
        TransactionModel
          .find(filter)
          .sort({ [q.sortBy]: q.sortOrder === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(q.limit),
        TransactionModel.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / q.limit);

      return res.send({
        page: q.page,
        limit: q.limit,
        total,
        totalPages,
        items: transactions.map(transaction => serializeTransaction(transaction))
      })
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
