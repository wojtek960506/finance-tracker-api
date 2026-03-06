import { findCategoryByName } from "@category/db"
import { persistTransactionPair } from "@transaction/db"
import { serializeCategory } from "@category/serializers"
import { getNextSourceIndex } from "@transaction/services"
import { TransactionResponseDTO } from "@transaction/schema"
import {
  CategoryNotFoundError,
  SystemCategoryHasOwner,
  SystemCategoryWrongType,
} from "@utils/errors"
import {
  TransactionCreateProps,
  PreparedTransactionCreateProps,
  PrepareTransactionPropsContext,
  PrepareTransactionPropsObjectIds,
} from "@transaction/services/types"


export const createTransactionPair = async <
  T extends TransactionCreateProps
>(
  ownerId: string,
  systemCategoryName: "myAccount" | "exchange",
  prepareProps: (
    objectIds: PrepareTransactionPropsObjectIds,
    context: PrepareTransactionPropsContext
  ) => PreparedTransactionCreateProps<T>,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {

  const categoryDB = await findCategoryByName(systemCategoryName);
  if (!categoryDB) throw new CategoryNotFoundError(undefined, systemCategoryName);
  
  const category = serializeCategory(categoryDB);
  if (category.type !== "system")
    throw new SystemCategoryWrongType(category.id, systemCategoryName);
  if (category.ownerId)
    throw new SystemCategoryHasOwner(category.id);

  const sourceIndexExpense = await getNextSourceIndex(ownerId)
  const sourceIndexIncome = await getNextSourceIndex(ownerId);

  const { expenseTransactionProps, incomeTransactionProps } = prepareProps(
    { categoryId: category.id },
    { ownerId, sourceIndexExpense, sourceIndexIncome }
  );

  return persistTransactionPair(expenseTransactionProps, incomeTransactionProps);
}
