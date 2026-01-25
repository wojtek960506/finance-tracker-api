import { prepareExchangeProps } from "@services/transactions";
import { loadTransactionWithReference, saveTransactionPairChanges } from "@db/transactions";
import { TransactionResponseDTO, TransactionCreateExchangeDTO } from "@schemas/transaction";



export const updateExchangeTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionCreateExchangeDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const { transaction, transactionRef } = await loadTransactionWithReference(
    transactionId, userId, "exchange"
  );

  const {
    expenseTransactionProps,
    incomeTransactionProps,
  } = prepareExchangeProps(dto);

  const result = await saveTransactionPairChanges(
    transaction,
    transactionRef,
    expenseTransactionProps,
    incomeTransactionProps
  );

  return result;
}