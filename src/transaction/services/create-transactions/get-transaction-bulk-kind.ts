import {
  TransactionBulkItemExchangeDTO,
  TransactionBulkItemStandardDTO,
  TransactionBulkItemTransferDTO,
  TransactionCreateBulkItemDTO,
} from '@transaction/schema';

export const isExchangeTransactionDTO = (
  dto: TransactionCreateBulkItemDTO,
): dto is TransactionBulkItemExchangeDTO => dto.kind === 'exchange';

export const isStandardTransactionDTO = (
  dto: TransactionCreateBulkItemDTO,
): dto is TransactionBulkItemStandardDTO => dto.kind === 'standard';

export const isTransferTransactionDTO = (
  dto: TransactionCreateBulkItemDTO,
): dto is TransactionBulkItemTransferDTO => dto.kind === 'transfer';

export const countPreparedTransactions = (dto: TransactionCreateBulkItemDTO) =>
  dto.kind === 'transfer' || dto.kind === 'exchange' ? 2 : 1;
