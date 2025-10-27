import { FastifyInstance } from "fastify";
import { Transaction } from "@models/Transaction";
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
import { ParamsJustId } from "./types";
import { updateTransactionHelper } from "@utils/routes";
import { validateBody } from "@utils/validation";


export async function transactionRoutes(app: FastifyInstance) {
  app.get<{ Reply: TransactionsResponseDTO }>(
    "/",
    async () => {
      return await Transaction.find().sort({ date: -1 });
    }
  );

  app.get<{ Params: ParamsJustId; Reply: TransactionResponseDTO | { message: string} }>(
    "/:id",
    async (req, res) => {
      const { id } = req.params;
      const transaction = await Transaction.findById(id);
      if (!transaction)
        return res.code(404).send({ message: `Transaction with ID '${id}' not found`});

      return transaction;
    }
  )

  app.post<{ Body: TransactionCreateDTO; Reply: TransactionResponseDTO }>(
    "/",
    { preHandler: validateBody(TransactionCreateSchema) },
    async (req, res) => {    
      const newTransaction = await Transaction.create(req.body)
      res.code(201).send(newTransaction);
    }
  );

  app.put<{ Params: ParamsJustId ; Body: TransactionUpdateDTO }>(
    "/:id",
    { preHandler: validateBody(TransactionUpdateSchema) },
    (req, res) => updateTransactionHelper(req, res, true)
  );

  app.patch<{ Params: ParamsJustId ; Body: TransactionPatchDTO }>(
    "/:id",
    { preHandler: validateBody(TransactionPatchSchema) },
    (req, res) => updateTransactionHelper(req, res, false)
  );

  app.delete<{ Params: ParamsJustId }>("/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await Transaction.findByIdAndDelete(id, { new: true });
    if (!deleted)
      return res.code(404).send({ message: `Transaction with ID '${id}' not found` });
    return res.send({ message: `Transaction with ID '${id}' was deleted`, data: deleted });
  })

}