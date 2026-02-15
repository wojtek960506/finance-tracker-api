import { findCategoryByName } from "@db/categories";
import { serializeCategory } from "@schemas/serializers";
import { persistTransactionPair } from "@db/transactions";
import { getNextSourceIndex } from "@services/transactions";
import { TransactionResponseDTO } from "@schemas/transaction";
import {
  CategoryNotFoundError,
  SystemCategoryHasOwner,
  SystemCategoryWrongType,
} from "@utils/errors";
import {
  TransactionCreateProps,
  PreparedTransactionCreateProps,
  PrepareTransactionPropsContext,
  PrepareTransactionPropsObjectIds,
} from "@services/transactions/types";


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
