import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionCreateDTO } from "@schemas/transaction";
import { TransactionModel } from "@models/transaction-model";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { getNextSourceIndex } from "@/services/get-next-source-index";


export async function createTransactionHandler(
  req: FastifyRequest<{ Body: TransactionCreateDTO }>,
  res: FastifyReply
) {
  const userId = (req as AuthenticatedRequest).userId

  const sourceIndex = await getNextSourceIndex(userId);
  console.log('source index', sourceIndex)

  const newTransaction = await TransactionModel.create({
    ...req.body,
    sourceIndex,
    ownerId: userId
  })
  return res.code(201).send(serializeTransaction(newTransaction));
}