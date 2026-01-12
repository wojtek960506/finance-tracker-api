import { TransactionCreateStandardDTO } from "@schemas/transaction";


export type TransferTransactionProps = TransactionCreateStandardDTO & {
  ownerId: string,
  sourceIndex: number,
  sourceRefIndex: number,
};

export type ExchangeTransactionProps = TransferTransactionProps & {
  currencies: string,
  exchangeRate: number,
};