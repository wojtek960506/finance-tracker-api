import {
  TransactionCreateBulkItemDTO,
  TransactionExchangeDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from '@transaction/schema';

export const isExchangeTransactionDTO = (
  dto: TransactionCreateBulkItemDTO,
): dto is TransactionExchangeDTO => dto.kind === 'exchange' || 'currencyExpense' in dto;

export const isStandardTransactionDTO = (
  dto: TransactionCreateBulkItemDTO,
): dto is TransactionStandardDTO => dto.kind === 'standard' || 'transactionType' in dto;

export const isTransferTransactionDTO = (
  dto: TransactionCreateBulkItemDTO,
): dto is TransactionTransferDTO =>
  dto.kind === 'transfer' ||
  (!isExchangeTransactionDTO(dto) && !isStandardTransactionDTO(dto));

export const countPreparedTransactions = (dto: TransactionCreateBulkItemDTO) =>
  isStandardTransactionDTO(dto) ? 1 : 2;
