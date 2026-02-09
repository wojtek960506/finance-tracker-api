import { startSession } from "mongoose";
import { AppError } from "@utils/errors";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionModel } from "@models/transaction-model";
import { createRandomTransactions } from "@routes/user-routes/handlers";


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
  const session = await startSession();
  try {
    await session.withTransaction(async () => {
      const insertedCount = await createRandomTransactions(
        ownerId, totalTransactions, session,
      );
      return res.code(201).send({ insertedCount });
    });
  } finally {
    await session.endSession();
  }
}