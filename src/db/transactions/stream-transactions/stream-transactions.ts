import { TransactionModel } from "@models/transaction-model";

export const streamTransactions = (ownerId: string) =>
  TransactionModel.find({ ownerId }).sort({ sourceIndex: 1 }).cursor();