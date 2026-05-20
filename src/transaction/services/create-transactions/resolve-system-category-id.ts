import { findNamedResourceByName } from '@named-resource/db';
import { getNamedResourceKindConfig } from '@named-resource/kind-config';
import {
  AppError,
  CategoryNotFoundError,
  SystemCategoryHasOwner,
  SystemCategoryWrongType,
} from '@utils/errors';

export const resolveSystemCategoryId = async (
  systemCategoryName: 'exchange' | 'myAccount',
) => {
  const categoryDB = await findNamedResourceByName('category', systemCategoryName);
  if (!categoryDB) throw new CategoryNotFoundError(undefined, systemCategoryName);

  const category =
    'toObject' in categoryDB
      ? getNamedResourceKindConfig('category').serialize(categoryDB)
      : categoryDB;
  const categoryId = category.id ?? (category as { _id?: { toString(): string } })._id?.toString();

  if (!categoryId)
    throw new AppError(500, 'System category is missing id', undefined, 'CATEGORY_ID_MISSING');
  if (category.type !== 'system')
    throw new SystemCategoryWrongType(categoryId, systemCategoryName);
  if (category.ownerId) throw new SystemCategoryHasOwner(categoryId);

  return categoryId;
};
