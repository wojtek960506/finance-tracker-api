import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { getNextSourceIndex } from "@services/transactions";
import { TransactionCreateStandardDTO } from "@schemas/transaction";
import { persistStandardTransaction } from "@db/transactions/persist-transaction";


export async function createStandardTransactionHandler(
  req: FastifyRequest<{ Body: TransactionCreateStandardDTO }>,
  res: FastifyReply
) {
  const userId = (req as AuthenticatedRequest).userId;
  const sourceIndex = await getNextSourceIndex(userId);

  const newTransaction = await persistStandardTransaction({
    ...req.body,
    ownerId: userId,
    sourceIndex,
  })
  return res.code(201).send(newTransaction);
}