import { ClientSession } from "mongoose";
import { AppError } from "@utils/errors";
import { withSession } from "@utils/with-session";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionModel } from "@models/transaction-model";
import { createRandomTransactions } from "@services/transactions";


const createRandomTransactionsCore = async (
  session: ClientSession,
  ownerId: string,
  totalTransactions: number,
): Promise<{ insertedCount: number }> => {
  const insertedCount = await createRandomTransactions(
    ownerId, totalTransactions, session,
  );
  return { insertedCount };
}

export const createTestTransactionsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const transactionsCount = await TransactionModel.countDocuments({ ownerId });
  if (transactionsCount !== 0)
    throw new AppError(
      409,
      "Cannot add test transactions to a user which already owns some transactions",
    );

  const totalTransactions = 200;
  const result = await withSession(
    createRandomTransactionsCore,
    ownerId,
    totalTransactions,
  )
  return res.code(201).send(result);
}