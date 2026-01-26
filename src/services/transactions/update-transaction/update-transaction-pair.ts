import { TransactionResponseDTO } from "@schemas/transaction";
import {
  saveTransactionPairChanges,
  loadTransactionWithReference,
} from "@db/transactions";
import {
  TransactionUpdateProps,
  PreparedTransactionUpdateProps,
} from "@services/transactions/types";


export const updateTransactionPair = async <
    T extends TransactionUpdateProps
>(
  transactionId: string,
  userId: string, 
  kind: "exchange" | "myAccount",
  prepareProps: () => PreparedTransactionUpdateProps<T>
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const { transaction, transactionRef } = await loadTransactionWithReference(
    transactionId, userId, kind
  );

  const { expenseTransactionProps, incomeTransactionProps } = prepareProps()

  return saveTransactionPairChanges(
    transaction,
    transactionRef,
    expenseTransactionProps,
    incomeTransactionProps,
  );
}