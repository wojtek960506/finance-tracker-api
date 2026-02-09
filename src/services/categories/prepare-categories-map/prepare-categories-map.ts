import { findCategories } from "@db/categories";
import { CategoryResponseDTO } from "@schemas/category";
import { ITransaction } from "@models/transaction-model";


export type CategoriesMap = Record<
  string,
  Pick<CategoryResponseDTO, "id" | "type" | "name">
>;

export const prepareCategoriesMap = async (
  ownerId: string,
  transactions?: Pick<ITransaction, "categoryId">[]
) => {
  const categoryIds = transactions?.map(t => t.categoryId.toString());
  const categories = await findCategories(ownerId, categoryIds);
  return Object.fromEntries(categories.map(
    c => [c._id.toString(), { id: c._id.toString(), type: c.type, name: c.name }]
  ));
}
