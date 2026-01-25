import { TransactionCreateStandardDTO } from "@schemas/transaction";

export type TransferTransactionUpdateProps = Omit<
  TransactionCreateStandardDTO, "category" | "transactionType"
>;

export type ExchangeTransactionUpdateProps = TransferTransactionUpdateProps & {
  currencies: string,
  exchangeRate: number,
}