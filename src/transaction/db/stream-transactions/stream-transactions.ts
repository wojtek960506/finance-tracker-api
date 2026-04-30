import { TransactionModel } from '@transaction/model';

export const streamTransactions = (ownerId: string) =>
  TransactionModel.find({ ownerId, deletion: null }).sort({ sourceIndex: 1 }).cursor();
