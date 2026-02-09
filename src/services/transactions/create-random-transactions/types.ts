import { TransactionStandardDTO } from "@schemas/transaction";


export type RandomStandardTransaction = TransactionStandardDTO & {
  ownerId: string;
  sourceIndex: number
  sourceRefIndex?: number,
};

export type RandomTransferTransaction = Omit<RandomStandardTransaction, "sourceRefIndex"> & { 
  sourceRefIndex: number;
};

export type RandomTransferTransactionPair = [
  RandomTransferTransaction,
  RandomTransferTransaction
];

export type RandomExchangeTransaction = RandomTransferTransaction & {
  currencies: string;
  exchangeRate: number;
};

export type RandomExchangeTransactionPair = [
  RandomExchangeTransaction,
  RandomExchangeTransaction
];

export type RandomTransaction = RandomStandardTransaction | RandomExchangeTransaction |
  RandomTransferTransaction;
