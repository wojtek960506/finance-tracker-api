import { TransactionStandardDTO } from '@transaction/schema';

export type TransactionTransferUpdateProps = Omit<
  TransactionStandardDTO,
  'category' | 'transactionType' | 'kind'
> & {
  kind: 'transfer';
  transactionType: string;
};

export type TransactionExchangeUpdateProps = Omit<
  TransactionTransferUpdateProps,
  'kind'
> & {
  kind: 'exchange';
  currencies: string;
  exchangeRate: number;
};
