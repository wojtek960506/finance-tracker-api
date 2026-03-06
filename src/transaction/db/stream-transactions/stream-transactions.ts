import { TransactionModel } from "@transaction/model"

export const streamTransactions = (ownerId: string) =>
  TransactionModel.find({ ownerId }).sort({ sourceIndex: 1 }).cursor();