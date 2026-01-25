import { TransactionModel } from "@models/transaction-model";
import { TransactionResponseDTO } from "@schemas/transaction";
import { persistTransactionPair } from "./persist-transaction-pair";
import { serializeTransaction } from "@schemas/serialize-transaction";
import {
  TransactionExchangeCreateProps,
  TransactionStandardCreateProps,
  TransactionTransferCreateProps,
} from "./types";

// TODO naming convention (service -> db operation)
// createStandardTransaction -> peresistStandardTransaction
// updateStandardTransaction -> saveStandardTransactionChanges
// deleteStandardTransaction -> removeStandardTransaction

// TODO
// * probably remove `persistTransferTransaction` and `persistExchangeTransaction`
//   and just use `persistTransactionPair` in the proper places
// * rename `persistStandardTransaction` to just `persistTransaction`
// * in case of more kinds of transactions then some union will be allowed as it is in
//   `persistTransactionPair`

export async function persistStandardTransaction(props: TransactionStandardCreateProps) {
  const newTransaction = await TransactionModel.create(props);
  return serializeTransaction(newTransaction);
}

export async function persistTransferTransaction (
  expenseTransactionProps: TransactionTransferCreateProps,
  incomeTransactionProps: TransactionTransferCreateProps,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> {
  const result = await persistTransactionPair(
    expenseTransactionProps,
    incomeTransactionProps,
  );
  return result;
}

export async function persistExchangeTransaction (
  expenseTransactionProps: TransactionExchangeCreateProps,
  incomeTransactionProps: TransactionExchangeCreateProps,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> {
  const result = await persistTransactionPair(
    expenseTransactionProps,
    incomeTransactionProps,
  );
  return result;
}