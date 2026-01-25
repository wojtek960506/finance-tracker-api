import { TransactionStandardDTO } from "@schemas/transaction";

export type StandardTransactionProps = TransactionStandardDTO & {
  ownerId: string,
  sourceIndex: number,
}

export type TransferTransactionProps = StandardTransactionProps & {
  sourceRefIndex: number,
};

export type ExchangeTransactionProps = TransferTransactionProps & {
  currencies: string,
  exchangeRate: number,
};