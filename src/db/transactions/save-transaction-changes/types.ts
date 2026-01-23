import { TransactionUpdateStandardDTO } from "@schemas/transaction";

export type TransferTransactionUpdateProps = Omit<
  TransactionUpdateStandardDTO, "category" | "transactionType"
>;

export type ExchangeTransactionUpdateProps = TransferTransactionUpdateProps & {
  currencies: string,
  exchangeRate: number,
}