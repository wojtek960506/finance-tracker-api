import { FastifyInstance } from "fastify";
import { Transaction } from "@models/Transaction";
import { 
  TransactionCreateDTO,
  TransactionCreateSchema,
  TransactionPatchDTO,
  TransactionPatchSchema,
  TransactionUpdateDTO,
  TransactionUpdateSchema
} from "@schemas/transaction";
import { ParamsJustId } from "./types";
import { getUpdatedTransaction } from "@utils/routes";
import { validateBody } from "@utils/validation";

export async function transactionRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return await Transaction.find().sort({ date: -1 });
  });

  app.get<{ Params: ParamsJustId }>("/:id", async (req, res) => {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    if (!transaction)
      return res.code(404).send({ message: `Transaction with ID '${id}' not found`});

    return transaction;
  })

  app.post<{ Body: TransactionCreateDTO }>(
    "/",
    { preHandler: validateBody(TransactionCreateSchema) },
    async (req, res) => {
      const transaction = new Transaction(req.body);
      await transaction.save();
      res.code(201).send(transaction);
  });

  app.put<{ Params: ParamsJustId ; Body: TransactionUpdateDTO }>(
    "/:id",
    { preHandler: validateBody(TransactionUpdateSchema) },
    async (req, res) => {
      const { id } = req.params;
      const updated = await getUpdatedTransaction(id, req.body, true);
      if (!updated)
        return res.code(404).send({ message: `Transaction with ID '${id}' not found` });
      return res.send({ message: `Transaction with ID '${id}' updated`, data: updated });
    }
  );

  app.patch<{ Params: ParamsJustId ; Body: TransactionPatchDTO }>(
    "/:id",
    { preHandler: validateBody(TransactionPatchSchema) },
    async (req, res) => {
      const { id } = req.params;
      const updated = await getUpdatedTransaction(id, req.body, false);
      if (!updated)
        return res.code(404).send({ message: `Transaction with ID '${id}' not found` });
      return res.send({ message: `Transaction with ID '${id}' updated`, data: updated });
    }
  );

  app.delete<{ Params: ParamsJustId }>("/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await Transaction.findByIdAndDelete(id, { new: true });
    if (!deleted)
      return res.code(404).send({ message: `Transaction with ID '${id}' not found` });
    return res.send({ message: `Transaction with ID '${id}' was deleted`, data: deleted });
  })

}