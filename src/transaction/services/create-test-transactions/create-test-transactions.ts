import { ClientSession } from 'mongoose';

import { TransactionModel } from '@transaction/model';
import { createRandomTransactions } from '@transaction/services';
import { AppError } from '@utils/errors';
import { withSession } from '@utils/with-session';

const createTestTransactionsCore = async (
  session: ClientSession,
  ownerId: string,
  totalTransactions: number,
): Promise<{ insertedCount: number }> => {
  const insertedCount = await createRandomTransactions(
    ownerId,
    totalTransactions,
    session,
  );
  return { insertedCount };
};

export const createTestTransactions = async (
  ownerId: string,
  totalTransactions?: number,
): Promise<{ insertedCount: number }> => {
  const transactionsCount = await TransactionModel.countDocuments({ ownerId });
  if (transactionsCount !== 0)
    throw new AppError(
      409,
      'Cannot add test transactions to a user which already owns some transactions',
    );

  totalTransactions = totalTransactions ?? 200;
  return withSession(createTestTransactionsCore, ownerId, totalTransactions);
};
