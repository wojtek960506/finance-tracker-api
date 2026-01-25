import { TransactionResponseDTO } from "@schemas/transaction";
import { getNextSourceIndex } from "@services/transactions/get-next-source-index";
import {
  persistTransactionPair,
  TransactionExchangeCreateProps,
  TransactionTransferCreateProps
} from "@db/transactions";


type PrepareContext = {
  ownerId: string,
  sourceIndexExpense: number,
  sourceIndexIncome: number,
}

type PreparedProps = {
  expenseTransactionProps: TransactionExchangeCreateProps,
  incomeTransactionProps: TransactionExchangeCreateProps,
} | {
  expenseTransactionProps: TransactionTransferCreateProps,
  incomeTransactionProps: TransactionTransferCreateProps,
}

export const createTransactionPair = async (
  ownerId: string,
  prepareProps: (context: PrepareContext) => PreparedProps,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const sourceIndexExpense = await getNextSourceIndex(ownerId)
  const sourceIndexIncome = await getNextSourceIndex(ownerId);

  const { expenseTransactionProps, incomeTransactionProps } = prepareProps(
    { ownerId, sourceIndexExpense, sourceIndexIncome }
  );

  return persistTransactionPair(expenseTransactionProps, incomeTransactionProps);
}