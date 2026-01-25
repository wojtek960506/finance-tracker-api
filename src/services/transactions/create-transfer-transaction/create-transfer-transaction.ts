import { persistTransactionPair } from "@db/transactions/persist-transaction";
import { getNextSourceIndex, prepareTransferProps } from "@services/transactions";
import { TransactionResponseDTO, TransactionTransferDTO } from "@schemas/transaction";


export const createTransferTransaction = async (
  dto: TransactionTransferDTO,
  ownerId: string,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const sourceIndexExpense = await getNextSourceIndex(ownerId);
  const sourceIndexIncome = await getNextSourceIndex(ownerId);
  
  const {
    expenseTransactionProps,
    incomeTransactionProps,
  } = prepareTransferProps(dto, { ownerId, sourceIndexExpense, sourceIndexIncome });

  const [
    expenseTransaction,
    incomeTransaction,
  ] = await persistTransactionPair(expenseTransactionProps, incomeTransactionProps);

  return [expenseTransaction, incomeTransaction];
}