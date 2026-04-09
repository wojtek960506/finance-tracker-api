import { TransactionDeletion } from '@transaction/model';

const TRASH_RETENTION_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const buildTransactionDeletion = (
  deletedAt = new Date(),
): TransactionDeletion => ({
  deletedAt,
  purgeAt: new Date(deletedAt.getTime() + TRASH_RETENTION_DAYS * DAY_IN_MS),
});
