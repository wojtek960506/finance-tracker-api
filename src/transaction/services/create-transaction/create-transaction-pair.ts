import { findCategoryByName } from '@category/db';
import { serializeCategory } from '@category/serializers';
import { persistTransactionPair } from '@transaction/db';
import { TransactionResponseDTO } from '@transaction/schema';
import { getNextSourceIndex } from '@transaction/services';
import {
  PreparedTransactionCreateProps,
  PrepareTransactionPropsContext,
  PrepareTransactionPropsObjectIds,
  TransactionCreateProps,
} from '@transaction/services/types';
import {
  CategoryNotFoundError,
  SystemCategoryHasOwner,
  SystemCategoryWrongType,
} from '@utils/errors';

export const createTransactionPair = async <T extends TransactionCreateProps>(
  ownerId: string,
  systemCategoryName: 'myAccount' | 'exchange',
  prepareProps: (
    objectIds: PrepareTransactionPropsObjectIds,
    context: PrepareTransactionPropsContext,
  ) => PreparedTransactionCreateProps<T>,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const categoryDB = await findCategoryByName(systemCategoryName);
  if (!categoryDB) throw new CategoryNotFoundError(undefined, systemCategoryName);

  const category = serializeCategory(categoryDB);
  if (category.type !== 'system')
    throw new SystemCategoryWrongType(category.id, systemCategoryName);
  if (category.ownerId) throw new SystemCategoryHasOwner(category.id);

  const sourceIndexExpense = await getNextSourceIndex(ownerId);
  const sourceIndexIncome = await getNextSourceIndex(ownerId);

  const { expenseTransactionProps, incomeTransactionProps } = prepareProps(
    { categoryId: category.id },
    { ownerId, sourceIndexExpense, sourceIndexIncome },
  );

  // TODO add check for paymentTransactionId

  return persistTransactionPair(expenseTransactionProps, incomeTransactionProps);
};
