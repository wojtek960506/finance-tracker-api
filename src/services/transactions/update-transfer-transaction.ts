import { prepareTransferProps } from "@services/transactions";
import { saveTransactionPairChanges, loadTransactionWithReference } from "@db/transactions";
import { TransactionResponseDTO, TransactionCreateTransferDTO } from "@schemas/transaction";


export const updateTransferTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionCreateTransferDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const { transaction, transactionRef } = await loadTransactionWithReference(
    transactionId, userId, "myAccount"
  );

  const {
    expenseTransactionProps,
    incomeTransactionProps,
  } = prepareTransferProps(dto);
  
  const result = await saveTransactionPairChanges(
    transaction,
    transactionRef,
    expenseTransactionProps,
    incomeTransactionProps,
  )

  return result;
}