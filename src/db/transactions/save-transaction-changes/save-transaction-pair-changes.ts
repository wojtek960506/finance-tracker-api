import { startSession } from "mongoose";
import { ITransaction } from "@models/transaction-model";
import { TransactionResponseDTO } from "@schemas/transaction";
import { ITransactionEnhanced, serializeTransaction } from "@schemas/serializers";
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

      await transaction.populate([
        { path: "categoryId", select: '_id type name' },
      ]);
      await transactionRef.populate([
        { path: "categoryId", select: '_id type name' },
      ]);
    })
  } finally {
    await session.endSession();
  }

  return [
    serializeTransaction(transaction as unknown as ITransactionEnhanced),
    serializeTransaction(transactionRef  as unknown as ITransactionEnhanced),
  ];
}
