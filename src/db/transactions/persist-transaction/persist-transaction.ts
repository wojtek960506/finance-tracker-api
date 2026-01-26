import { TransactionModel } from "@models/transaction-model";
import { TransactionResponseDTO } from "@schemas/transaction";
import { persistTransactionPair } from "./persist-transaction-pair";
import { serializeTransaction } from "@schemas/serialize-transaction";
import {
  ExchangeTransactionProps,
  StandardTransactionProps,
  TransferTransactionProps,
} from "./types";


export async function persistStandardTransaction(props: StandardTransactionProps) {
  const newTransaction = await TransactionModel.create(props);
  return serializeTransaction(newTransaction);
}

export async function persistTransferTransaction (
  expenseTransactionProps: TransferTransactionProps,
  incomeTransactionProps: TransferTransactionProps,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> {
  const result = await persistTransactionPair(
    expenseTransactionProps,
    incomeTransactionProps,
  );
  return result;
}

export async function persistExchangeTransaction (
  expenseTransactionProps: ExchangeTransactionProps,
  incomeTransactionProps: ExchangeTransactionProps,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> {
  const result = await persistTransactionPair(
    expenseTransactionProps,
    incomeTransactionProps,
  );
  return result;
}