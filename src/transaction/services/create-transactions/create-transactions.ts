import { persistTransactions } from '@transaction/db';
import { TransactionBulkCreateDTO, TransactionResponseDTO } from '@transaction/schema';
import { getNextSourceIndices } from '@transaction/services/get-next-source-index';

import {
  countPreparedTransactions,
  isExchangeTransactionDTO,
  isStandardTransactionDTO,
  isTransferTransactionDTO,
} from './get-transaction-bulk-kind';
import {
  prepareBulkExchangeTransactions,
  prepareBulkStandardTransaction,
  prepareBulkTransferTransactions,
} from './prepare-bulk-transaction';
import { resolveSystemCategoryId } from './resolve-system-category-id';
import { PreparedTransactionCreateProps, TransactionKindObjectIds } from './types';

export const createTransactions = async (
  dtoTransactions: TransactionBulkCreateDTO,
  ownerId: string,
): Promise<TransactionResponseDTO[]> => {
  const dtoList = dtoTransactions.transactions;
  const totalTransactions = dtoList.reduce(
    (sum, dto) => sum + countPreparedTransactions(dto),
    0,
  );
  const sourceIndices = await getNextSourceIndices(ownerId, totalTransactions);

  const preparedTransactions: PreparedTransactionCreateProps[] = [];
  const categoryObjectIds: TransactionKindObjectIds = {};

  for (const dto of dtoList) {
    if (isExchangeTransactionDTO(dto)) {
      categoryObjectIds.exchangeCategoryId ??= await resolveSystemCategoryId('exchange');

      const nextSourceIndices = sourceIndices.splice(0, 2) as [number, number];
      preparedTransactions.push(
        ...(await prepareBulkExchangeTransactions(
          dto,
          ownerId,
          nextSourceIndices,
          categoryObjectIds,
        )),
      );
      continue;
    }

    if (isTransferTransactionDTO(dto)) {
      categoryObjectIds.transferCategoryId ??= await resolveSystemCategoryId('myAccount');

      const nextSourceIndices = sourceIndices.splice(0, 2) as [number, number];
      preparedTransactions.push(
        ...(await prepareBulkTransferTransactions(
          dto,
          ownerId,
          nextSourceIndices,
          categoryObjectIds,
        )),
      );
      continue;
    }

    if (isStandardTransactionDTO(dto)) {
      const nextSourceIndex = sourceIndices.shift()!;
      preparedTransactions.push(
        await prepareBulkStandardTransaction(dto, ownerId, nextSourceIndex),
      );
    }
  }

  return persistTransactions(preparedTransactions);
};
