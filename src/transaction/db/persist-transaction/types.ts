import { TransactionStandardDTO } from '@transaction/schema';

export type TransactionStandardCreateProps = Omit<TransactionStandardDTO, 'kind'> & {
  kind: 'standard';
  ownerId: string;
  sourceIndex: number;
};

export type TransactionTransferCreateProps = Omit<
  TransactionStandardCreateProps,
  'kind'
> & {
  kind: 'transfer';
  sourceRefIndex: number;
};

export type TransactionExchangeCreateProps = Omit<
  TransactionTransferCreateProps,
  'kind'
> & {
  kind: 'exchange';
  currencies: string;
  exchangeRate: number;
};
