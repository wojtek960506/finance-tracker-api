import { ClientSession } from "mongoose";
import { withSession } from "@utils/with-session";
import { ITransaction } from "@transaction/model";
import { serializeTransaction } from "@transaction/serializers";
import { TransactionResponseDTO } from "@transaction/schema";
import { TransactionExchangeUpdateProps, TransactionTransferUpdateProps } from "./types";


export const saveTransactionPairChangesCore = async <
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

  console.log("before populate");
  console.log("transaction", transaction);
  console.log("transactionRef", transactionRef);

  await transaction.populate([
    { path: "categoryId", select: '_id type name' },
    { path: "paymentMethodId", select: "_id type name" },
  ]);
  await transactionRef.populate([
    { path: "categoryId", select: '_id type name' },
    { path: "paymentMethodId", select: "_id type name" },
  ]);

  console.log("after populate");
  console.log("transaction", transaction);
  console.log("transactionRef", transactionRef);

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
    saveTransactionPairChangesCore,
    transaction,
    transactionRef,
    expenseTransactionProps,
    incomeTransactionProps,
  )
);
