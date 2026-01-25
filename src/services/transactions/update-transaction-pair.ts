import { prepareExchangeProps, prepareTransferProps } from "@services/transactions";
import { loadTransactionWithReference, saveTransactionPairChanges } from "@db/transactions";
import {
  TransactionResponseDTO,
  TransactionExchangeDTO,
  TransactionTransferDTO,
} from "@schemas/transaction";


export const updateTransactionPair = async (
  transactionId: string,
  userId: string,
  dto: TransactionExchangeDTO | TransactionTransferDTO,
  kind: "exchange" | "myAccount"
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const { transaction, transactionRef } = await loadTransactionWithReference(
    transactionId, userId, kind
  );

  const { 
    expenseTransactionProps,
    incomeTransactionProps,
  } = 'currencyExpense' in dto ? prepareExchangeProps(dto) : prepareTransferProps(dto);

  const result = await saveTransactionPairChanges(
    transaction,
    transactionRef,
    expenseTransactionProps,
    incomeTransactionProps
  );

  return result;
}