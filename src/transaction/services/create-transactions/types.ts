import {
  TransactionExchangeCreateProps,
  TransactionStandardCreateProps,
  TransactionTransferCreateProps,
} from '@transaction/db';

export type TransactionKindObjectIds = {
  exchangeCategoryId?: string;
  transferCategoryId?: string;
};

export type PreparedTransactionCreateProps =
  | TransactionStandardCreateProps
  | TransactionTransferCreateProps
  | TransactionExchangeCreateProps;
