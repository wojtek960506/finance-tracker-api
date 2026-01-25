import { persistTransactionPair } from "@db/transactions/persist-transaction";
import { getNextSourceIndex, prepareExchangeProps } from "@services/transactions";
import { TransactionExchangeDTO, TransactionResponseDTO } from "@schemas/transaction";


export const createExchangeTransaction = async (
  dto: TransactionExchangeDTO,
  ownerId: string,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const sourceIndexExpense = await getNextSourceIndex(ownerId);
  const sourceIndexIncome = await getNextSourceIndex(ownerId);

  const {
    expenseTransactionProps,
    incomeTransactionProps
  } = prepareExchangeProps(dto, { ownerId, sourceIndexExpense, sourceIndexIncome });

  const [
    expenseTransaction,
    incomeTransaction
  ] = await persistTransactionPair(expenseTransactionProps, incomeTransactionProps);

  return [expenseTransaction, incomeTransaction];
}