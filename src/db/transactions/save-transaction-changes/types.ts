import { TransactionUpdateStandardDTO } from "@schemas/transaction";

export type TransferTransactionUpdateProps = Omit<
  TransactionUpdateStandardDTO, "category" | "transactionType"
>;