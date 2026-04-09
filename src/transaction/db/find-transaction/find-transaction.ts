import { TransactionModel } from '@transaction/model';
import { TransactionNotFoundError } from '@utils/errors';

export type TransactionDeletionState = 'active' | 'trash' | 'any';

export type FindTransactionOptions = {
  deletionState?: TransactionDeletionState;
};

const buildDeletionFilter = (deletionState: TransactionDeletionState) => {
  if (deletionState === 'trash') return { 'deletion.deletedAt': { $exists: true } };
  if (deletionState === 'active') return { deletion: null };
  return {};
};

export const findTransactionNullable = (
  id: string,
  options: FindTransactionOptions = {},
) => {
  const { deletionState = 'active' } = options;

  return TransactionModel.findOne({
    _id: id,
    ...buildDeletionFilter(deletionState),
  });
};

export const findTransaction = async (
  id: string,
  options: FindTransactionOptions = {},
) => {
  const transaction = await findTransactionNullable(id, options);
  if (!transaction) throw new TransactionNotFoundError(id);
  return transaction;
};
