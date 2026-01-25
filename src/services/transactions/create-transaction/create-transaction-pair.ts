import { persistTransactionPair } from "@db/transactions";
import { getNextSourceIndex } from "@services/transactions";
import { TransactionResponseDTO } from "@schemas/transaction";
import {
  TransactionCreateProps,
  PreparedTransactionCreateProps,
  PrepareTransactionPropsContext,
} from "@services/transactions/types";


export const createTransactionPair = async <
  T extends TransactionCreateProps
>(
  ownerId: string,
  prepareProps: (
    context: PrepareTransactionPropsContext
  ) => PreparedTransactionCreateProps<T>,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const sourceIndexExpense = await getNextSourceIndex(ownerId)
  const sourceIndexIncome = await getNextSourceIndex(ownerId);

  const { expenseTransactionProps, incomeTransactionProps } = prepareProps(
    { ownerId, sourceIndexExpense, sourceIndexIncome }
  );

  return persistTransactionPair(expenseTransactionProps, incomeTransactionProps);
}