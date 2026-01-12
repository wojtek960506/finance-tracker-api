import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionCreateStandardDTO } from "@schemas/transaction";
import { createStandardTransaction, getNextSourceIndex } from "@services/transactions";


export async function createStandardTransactionHandler(
  req: FastifyRequest<{ Body: TransactionCreateStandardDTO }>,
  res: FastifyReply
) {
  const userId = (req as AuthenticatedRequest).userId;
  const sourceIndex = await getNextSourceIndex(userId);

  const newTransaction = await createStandardTransaction(req.body, userId, sourceIndex);
  return res.code(201).send(newTransaction);
}