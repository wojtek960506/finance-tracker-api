import { TransferTransactionProps } from "./types";
import { persistTransactionPair } from "./persist-transaction-pair";


export async function persistTransferTransaction (
  expenseTransactionProps: TransferTransactionProps,
  incomeTransactionProps: TransferTransactionProps,
) {
  const result = await persistTransactionPair(
    expenseTransactionProps,
    incomeTransactionProps,
  );
  return result;
}