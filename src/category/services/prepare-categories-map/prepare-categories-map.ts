import { findCategories } from '@category/db';
import { CategoryResponseDTO } from '@category/schema';
import { prepareNamedResourcesMap } from '@shared/named-resource';
import { ITransaction } from '@transaction/model';

export type CategoriesMap = Record<
  string,
  Pick<CategoryResponseDTO, 'id' | 'type' | 'name'>
>;

export const prepareCategoriesMap = async (
  ownerId: string,
  transactions?: Pick<ITransaction, 'categoryId'>[],
) => {
  const categoryIds = transactions?.map((t) => t.categoryId.toString());
  const categories = await findCategories(ownerId, categoryIds);
  return prepareNamedResourcesMap(categories);
};
