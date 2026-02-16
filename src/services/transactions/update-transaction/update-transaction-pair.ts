import { findCategoryByName } from "@db/categories";
import { serializeCategory } from "@schemas/serializers";
import { TransactionResponseDTO } from "@schemas/transaction";
import {
  CategoryNotFoundError,
  SystemCategoryHasOwner,
  SystemCategoryWrongType,
} from "@utils/errors";
import {
  SystemCategoryName,
  saveTransactionPairChanges,
  loadTransactionWithReference,
} from "@db/transactions";
import {
  TransactionUpdateProps,
  PreparedTransactionUpdateProps,
  PrepareTransactionPropsObjectIds,
} from "@services/transactions/types";


export const updateTransactionPair = async <
    T extends TransactionUpdateProps
>(
  transactionId: string,
  userId: string, 
  systemCategoryName: SystemCategoryName,
  prepareProps: (
    objectIds: PrepareTransactionPropsObjectIds
  ) => PreparedTransactionUpdateProps<T>,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {

  const categoryDB = await findCategoryByName(systemCategoryName);
  if (!categoryDB) throw new CategoryNotFoundError(undefined, systemCategoryName);

  const category = serializeCategory(categoryDB);
  if (category.type !== "system")
    throw new SystemCategoryWrongType(category.id, systemCategoryName);
  if (category.ownerId)
    throw new SystemCategoryHasOwner(category.id);

  const { transaction, transactionRef } = await loadTransactionWithReference(
    transactionId, userId, category.id, systemCategoryName
  );

  const { expenseTransactionProps, incomeTransactionProps } = prepareProps(
    { categoryId: category.id },
  )

  return saveTransactionPairChanges(
    transaction,
    transactionRef,
    expenseTransactionProps,
    incomeTransactionProps,
  );
}
