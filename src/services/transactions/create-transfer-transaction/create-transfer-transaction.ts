import { createTransactionPair } from "../create-transaction-pair";
import { TransactionCreateStandardDTO } from "@schemas/transaction";


export type TransferTransactionProps = TransactionCreateStandardDTO & {
  ownerId: string,
  sourceIndex: number,
  sourceRefIndex: number,
};

export async function createTransferTransaction (
  expenseTransactionProps: TransferTransactionProps,
  incomeTransactionProps: TransferTransactionProps,
) {
  const result = await createTransactionPair(
    expenseTransactionProps,
    incomeTransactionProps,
  );
  return result;
}