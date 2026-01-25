import { getNextSourceIndex, prepareExchangeProps } from "@services/transactions";
import { persistExchangeTransaction } from "@db/transactions/persist-transaction";
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
  ] = await persistExchangeTransaction(expenseTransactionProps, incomeTransactionProps);

  return [expenseTransaction, incomeTransaction];
}