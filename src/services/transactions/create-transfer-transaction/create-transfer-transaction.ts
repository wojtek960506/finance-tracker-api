import { TransactionCreateTransferDTO } from "@schemas/transaction";
import { getNextSourceIndex } from "../get-next-source-index";
import { prepareTransferProps } from "../prepare-transfer-props";
import { persistTransferTransaction } from "@db/transactions/persist-transaction";

export const createTransferTransaction = async (
  dto: TransactionCreateTransferDTO,
  ownerId: string,
) => {
  const sourceIndexExpense = await getNextSourceIndex(ownerId);
  const sourceIndexIncome = await getNextSourceIndex(ownerId);
  
  const {
    expenseTransactionProps,
    incomeTransactionProps,
  } = prepareTransferProps(dto, { ownerId, sourceIndexExpense, sourceIndexIncome });

  const [
    expenseTransaction,
    incomeTransaction,
  ] = await persistTransferTransaction(expenseTransactionProps, incomeTransactionProps);

  return [expenseTransaction, incomeTransaction];
}