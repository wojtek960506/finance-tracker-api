import { FastifyInstance } from "fastify";
import { TransactionModel } from "@models/Transaction";
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
import { DeleteManyReply, ParamsJustId } from "./types";
import { updateTransactionHelper } from "@utils/routes";
import { validateBody } from "@utils/validation";
import { NotFoundError } from "@utils/errors";


export async function transactionRoutes(app: FastifyInstance) {
  app.get<{ Reply: TransactionsResponseDTO }>(
    "/",
    async () => {
      return await TransactionModel.find().sort({ date: -1 });
    }
  );

  app.get<{ Params: ParamsJustId; Reply: TransactionResponseDTO }>(
    "/:id",
    async (req, res) => {
      const { id } = req.params;
      const transaction = await TransactionModel.findById(id);
      if (!transaction)
        throw new NotFoundError(`Transaction with ID '${id}' not found`);

      return transaction;
    }
  )

  app.post<{ Body: TransactionCreateDTO; Reply: TransactionResponseDTO }>(
    "/",
    { preHandler: validateBody(TransactionCreateSchema) },
    async (req, res) => {    
      const newTransaction = await TransactionModel.create(req.body)
      res.code(201).send(newTransaction);
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
      
      return res.send(deleted);
    }
  )

  app.delete<{ Reply: DeleteManyReply }>("/", async (req, res) => {
    const tmp = await TransactionModel.deleteMany();
    return res.send(tmp);
  })
}
