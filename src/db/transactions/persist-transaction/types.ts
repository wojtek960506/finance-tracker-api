import { TransactionStandardDTO } from "@schemas/transaction";

export type TransactionStandardCreateProps = TransactionStandardDTO & {
  ownerId: string,
  sourceIndex: number,
}

export type TransactionTransferCreateProps = TransactionStandardCreateProps & {
  sourceRefIndex: number,
};

export type TransactionExchangeCreateProps = TransactionTransferCreateProps & {
  currencies: string,
  exchangeRate: number,
};