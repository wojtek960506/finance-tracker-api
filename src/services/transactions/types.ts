import {
  TransactionExchangeCreateProps,
  TransactionExchangeUpdateProps,
  TransactionTransferCreateProps,
  TransactionTransferUpdateProps,
} from "@db/transactions";

export type TransactionCreateProps =
  TransactionExchangeCreateProps |
  TransactionTransferCreateProps

export type TransactionUpdateProps = 
  TransactionExchangeUpdateProps |
  TransactionTransferUpdateProps

export type PrepareTransactionPropsContext = {
  ownerId: string,
  sourceIndexExpense: number,
  sourceIndexIncome: number,
}

export type PrepareTransactionPropsObjectIds = {
  categoryId: string,
}

export type PreparedTransactionCreateProps<T extends TransactionCreateProps> = {
  expenseTransactionProps: T,
  incomeTransactionProps: T
}

export type PreparedTransactionUpdateProps<T extends TransactionUpdateProps> = {
  expenseTransactionProps: T,
  incomeTransactionProps: T
}
