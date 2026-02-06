import { findCategories } from "@db/categories";
import { CategoryResponseDTO } from "@schemas/category";


export type CategoriesMap = Record<
  string,
  Pick<CategoryResponseDTO, "id" | "type" | "name">
>;

export const prepareCategoriesMap = async (
  ownerId: string,
  categoryIds: string[],
) => {
  const categories = await findCategories(ownerId, categoryIds);
  return Object.fromEntries(categories.map(
    c => [c._id.toString(), { id: c._id.toString(), type: c.type, name: c.name }]
  ));
}
