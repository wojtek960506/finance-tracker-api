import { ClientSession } from "mongoose";
import { AppError } from "@utils/errors";
import { withSession } from "@utils/with-session";
import { TransactionModel } from "@models/transaction-model";
import { createRandomTransactions } from "@services/transactions";


const createTestTransactionsCore = async (
  session: ClientSession,
  ownerId: string,
  totalTransactions: number,
): Promise<{ insertedCount: number }> => {
  const insertedCount = await createRandomTransactions(
    ownerId, totalTransactions, session,
  );
  return { insertedCount };
}

export const createTestTransactions = async (
  ownerId: string,
  totalTransactions?: number,
): Promise<{ insertedCount: number }> => {
  const transactionsCount = await TransactionModel.countDocuments({ ownerId });
  if (transactionsCount !== 0)
    throw new AppError(
      409,
      "Cannot add test transactions to a user which already owns some transactions",
    );

  totalTransactions = totalTransactions ?? 200;
  return withSession(
    createTestTransactionsCore,
    ownerId,
    totalTransactions,
  );
}
