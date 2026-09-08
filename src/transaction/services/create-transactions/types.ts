import {
  TransactionExchangeCreateProps,
  TransactionInvestmentCreateProps,
  TransactionStandardCreateProps,
  TransactionTransferCreateProps,
} from '@transaction/db';

export type TransactionKindObjectIds = {
  exchangeCategoryId?: string;
  transferCategoryId?: string;
  investmentCategoryId?: string;
};

export type PreparedTransactionCreateProps =
  | TransactionStandardCreateProps
  | TransactionTransferCreateProps
  | TransactionExchangeCreateProps
  | TransactionInvestmentCreateProps;
