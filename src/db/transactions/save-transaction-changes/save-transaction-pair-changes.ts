import { ClientSession } from "mongoose";
import { withSession } from "@utils/with-session";
import { ITransaction } from "@models/transaction-model";
import { serializeTransaction } from "@schemas/serializers";
import { TransactionResponseDTO } from "@schemas/transaction";
import { TransactionExchangeUpdateProps, TransactionTransferUpdateProps } from "./types";


export const saveTransactionPairChangesHandler = async <
  T extends TransactionExchangeUpdateProps | TransactionTransferUpdateProps
>(
  session: ClientSession,
  transaction: ITransaction,
  transactionRef: ITransaction,
  expenseTransactionProps: T,
  incomeTransactionProps: T,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  if (transaction.transactionType === "expense") {
    Object.assign(transaction, expenseTransactionProps);
    Object.assign(transactionRef, incomeTransactionProps);
  } else {
    Object.assign(transactionRef, expenseTransactionProps);
    Object.assign(transaction, incomeTransactionProps);
  }
  await transaction.save({ session });
  await transactionRef.save({ session });

  await transaction.populate([
    { path: "categoryId", select: '_id type name' },
  ]);
  await transactionRef.populate([
    { path: "categoryId", select: '_id type name' },
  ]);

  return [
    serializeTransaction(transaction),
    serializeTransaction(transactionRef),
  ];
}

export const saveTransactionPairChanges = async <
  T extends TransactionExchangeUpdateProps | TransactionTransferUpdateProps
>(
  transaction: ITransaction,
  transactionRef: ITransaction,
  expenseTransactionProps: T,
  incomeTransactionProps: T,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => (
  withSession(
    saveTransactionPairChangesHandler,
    transaction,
    transactionRef,
    expenseTransactionProps,
    incomeTransactionProps,
  )
);
