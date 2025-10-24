import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Transaction } from "@models/Transaction";
import { 
  ParamsJustId,
  TransactionCreateDTO,
  TransactionPatchDTO,
  TransactionUpdateDTO
} from "./types";

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

  app.post<{ Body: TransactionCreateDTO }>("/", async (req, res) => {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.code(201).send(transaction);
  });

  const updateTransactionHelper = async (
    req: FastifyRequest<{
      Params: ParamsJustId;
      Body: TransactionUpdateDTO | TransactionPatchDTO
    }>,
    res: FastifyReply,
    isFullUpdate: boolean
  ) => {
    const { id } = req.params;

    const updateBody = isFullUpdate ? req.body : { $set: req.body};

    // `new: true` - return the updated document
    const updated = await Transaction.findByIdAndUpdate(id, updateBody, { new: true });
    if (!updated)
      return res.code(404).send({ message: `Transaction with ID '${id}' not found` });
    return res.send({ message: `Transaction with ID '${id}' updated`, data: updated });
  }

  app.put<{ Params: ParamsJustId ; Body: TransactionUpdateDTO }>(
    "/:id",
    (req, res) => updateTransactionHelper(req, res, true)
  );

  app.patch<{ Params: ParamsJustId ; Body: TransactionPatchDTO }>(
    "/:id",
    (req, res) => updateTransactionHelper(req, res, true)
  );

  app.delete<{ Params: ParamsJustId }>("/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await Transaction.findByIdAndDelete(id, { new: true });
    if (!deleted)
      return res.code(404).send({ message: `Transaction with ID '${id}' not found` });
    return res.send({ message: `Transaction with ID '${id}' was deleted`, data: deleted });
  })

}