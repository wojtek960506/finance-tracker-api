import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { getNextSourceIndex } from "@services/transactions";
import { TransactionModel } from "@models/transaction-model";
import { TransactionCreateStandardDTO } from "@schemas/transaction";
import { serializeTransaction } from "@schemas/serialize-transaction";


export async function createStandardTransactionHandler(
  req: FastifyRequest<{ Body: TransactionCreateStandardDTO }>,
  res: FastifyReply
) {
  const userId = (req as AuthenticatedRequest).userId;
  const sourceIndex = await getNextSourceIndex(userId);

  const newTransaction = await TransactionModel.create({
    ...req.body,
    sourceIndex,
    ownerId: userId
  });
  return res.code(201).send(serializeTransaction(newTransaction));
}