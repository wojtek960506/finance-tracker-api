import { TransactionStandardDTO } from '@transaction/schema';

export type RandomStandardTransaction = Omit<TransactionStandardDTO, 'kind'> & {
  kind: 'standard';
  ownerId: string;
  sourceIndex: number;
  sourceRefIndex?: number;
};

export type RandomTransferTransaction = Omit<
  RandomStandardTransaction,
  'sourceRefIndex' | 'kind'
> & {
  kind: 'transfer';
  sourceRefIndex: number;
};

export type RandomTransferTransactionPair = [
  RandomTransferTransaction,
  RandomTransferTransaction,
];

export type RandomExchangeTransaction = Omit<RandomTransferTransaction, 'kind'> & {
  kind: 'exchange';
  currencies: string;
  exchangeRate: number;
};

export type RandomExchangeTransactionPair = [
  RandomExchangeTransaction,
  RandomExchangeTransaction,
];

export type RandomTransaction =
  | RandomStandardTransaction
  | RandomExchangeTransaction
  | RandomTransferTransaction;
