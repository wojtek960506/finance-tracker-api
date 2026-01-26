import { TransactionCreateStandardDTO } from "@schemas/transaction";

export type StandardTransactionProps = TransactionCreateStandardDTO & {
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