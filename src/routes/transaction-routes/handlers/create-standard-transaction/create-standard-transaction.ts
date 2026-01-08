import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { createStandardTransaction } from "@services/transactions";
import { TransactionCreateStandardDTO } from "@schemas/transaction";


export async function createStandardTransactionHandler(
  req: FastifyRequest<{ Body: TransactionCreateStandardDTO }>,
  res: FastifyReply
) {
  const userId = (req as AuthenticatedRequest).userId;
  const newTransaction = await createStandardTransaction(req.body, userId);
  return res.code(201).send(newTransaction);
}