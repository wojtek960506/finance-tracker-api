import {
  TransactionCreateBulkItemDTO,
  TransactionExchangeDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from '@transaction/schema';

export const isExchangeTransactionDTO = (
  dto: TransactionCreateBulkItemDTO,
): dto is TransactionExchangeDTO => 'currencyExpense' in dto;

export const isStandardTransactionDTO = (
  dto: TransactionCreateBulkItemDTO,
): dto is TransactionStandardDTO => 'transactionType' in dto;

export const isTransferTransactionDTO = (
  dto: TransactionCreateBulkItemDTO,
): dto is TransactionTransferDTO =>
  !isExchangeTransactionDTO(dto) && !isStandardTransactionDTO(dto);

export const countPreparedTransactions = (dto: TransactionCreateBulkItemDTO) =>
  isStandardTransactionDTO(dto) ? 1 : 2;
