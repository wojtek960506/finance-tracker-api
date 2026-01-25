import { TransactionStandardDTO } from "@schemas/transaction";

export type TransactionTransferUpdateProps = Omit<
  TransactionStandardDTO, "category" | "transactionType"
>;

export type TransactionExchangeUpdateProps = TransactionTransferUpdateProps & {
  currencies: string,
  exchangeRate: number,
}