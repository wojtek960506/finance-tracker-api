import { startSession } from "mongoose";
import { ITransaction } from "@models/transaction-model";
import { TransactionResponseDTO } from "@schemas/transaction";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { TransactionExchangeUpdateProps, TransactionTransferUpdateProps } from "./types";


export async function saveTransactionPairChanges<
  T extends TransactionExchangeUpdateProps | TransactionTransferUpdateProps
>(
  transaction: ITransaction,
  transactionRef: ITransaction,
  expenseTransactionProps: T,
  incomeTransactionProps: T,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> {
  const session = await startSession();
  
  try {
    await session.withTransaction(async () => {
      if (transaction.transactionType === "expense") {
        Object.assign(transaction, expenseTransactionProps);
        Object.assign(transactionRef, incomeTransactionProps);
      } else {
        Object.assign(transactionRef, expenseTransactionProps);
        Object.assign(transaction, incomeTransactionProps);
      }
      await transaction.save();
      await transactionRef.save();
    })
  } finally {
    await session.endSession();
  }

  return [
    serializeTransaction(transaction),
    serializeTransaction(transactionRef),
  ]
}