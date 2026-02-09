import { ClientSession } from "mongoose";
import { withSession } from "@utils/with-session";
import { serializeTransaction } from "@schemas/serializers";
import { TransactionModel } from "@models/transaction-model";
import { TransactionResponseDTO } from "@schemas/transaction";
import { TransactionExchangeCreateProps, TransactionTransferCreateProps } from "./types";


const persistTransactionPairCore = async <
  T extends TransactionExchangeCreateProps | TransactionTransferCreateProps
>(
  session: ClientSession,
  expenseTransactionProps: T,
  incomeTransactionProps: T,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const [
    { _id: expenseTransactionId },
    { _id: incomeTransactionId },
  ] = await TransactionModel.create(
    [expenseTransactionProps, incomeTransactionProps],
    { session, ordered: true }
  );
  
  const expenseTransaction = await TransactionModel.findOneAndUpdate(
    { _id: expenseTransactionId },
    { refId: incomeTransactionId },
    { session, new: true }
  ).populate([
    { path: 'categoryId', select: '_id type name' },
  ]);
  const incomeTransaction = await TransactionModel.findOneAndUpdate(
    { _id: incomeTransactionId },
    { refId: expenseTransactionId },
    { session, new: true }
  ).populate([
    { path: 'categoryId', select: '_id type name' },
  ]);

  return [
    serializeTransaction(expenseTransaction!),
    serializeTransaction(incomeTransaction!),
  ]
}

export const persistTransactionPair = async <
  T extends TransactionExchangeCreateProps | TransactionTransferCreateProps
>(
  expenseTransactionProps: T,
  incomeTransactionProps: T,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => (
  withSession(
    persistTransactionPairCore,
    expenseTransactionProps,
    incomeTransactionProps,
  )
);
