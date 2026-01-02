import { TransactionCreateDTO } from "@schemas/transaction";

export type RandomStandardTransaction = TransactionCreateDTO & {
  ownerId: string;
  sourceIndex: number
};

export type RandomTransferTransaction = RandomStandardTransaction & { sourceRefIndex: number; };

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