import { TransactionStandardDTO } from "@schemas/transaction";

export type TransferTransactionUpdateProps = Omit<
  TransactionStandardDTO, "category" | "transactionType"
>;

export type ExchangeTransactionUpdateProps = TransferTransactionUpdateProps & {
  currencies: string,
  exchangeRate: number,
}