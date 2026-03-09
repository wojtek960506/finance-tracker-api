import { findCategoryByName } from '@category/db';
import { serializeCategory } from '@category/serializers';
import {
  loadTransactionWithReference,
  saveTransactionPairChanges,
  SystemCategoryName,
} from '@transaction/db';
import { TransactionResponseDTO } from '@transaction/schema';
import {
  PreparedTransactionUpdateProps,
  PrepareTransactionPropsObjectIds,
  TransactionUpdateProps,
} from '@transaction/services/types';
import {
  CategoryNotFoundError,
  SystemCategoryHasOwner,
  SystemCategoryWrongType,
} from '@utils/errors';

export const updateTransactionPair = async <T extends TransactionUpdateProps>(
  transactionId: string,
  userId: string,
  systemCategoryName: SystemCategoryName,
  prepareProps: (
    objectIds: PrepareTransactionPropsObjectIds,
  ) => PreparedTransactionUpdateProps<T>,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const categoryDB = await findCategoryByName(systemCategoryName);
  if (!categoryDB) throw new CategoryNotFoundError(undefined, systemCategoryName);

  const category = serializeCategory(categoryDB);
  if (category.type !== 'system')
    throw new SystemCategoryWrongType(category.id, systemCategoryName);
  if (category.ownerId) throw new SystemCategoryHasOwner(category.id);

  const { transaction, transactionRef } = await loadTransactionWithReference(
    transactionId,
    userId,
    category.id,
    systemCategoryName,
  );

  const { expenseTransactionProps, incomeTransactionProps } = prepareProps({
    categoryId: category.id,
  });

  // TODO add check for paymentTransactionId

  return saveTransactionPairChanges(
    transaction,
    transactionRef,
    expenseTransactionProps,
    incomeTransactionProps,
  );
};
