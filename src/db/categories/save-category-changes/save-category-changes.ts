import { ICategory } from "@models/category-model";
import { CategoryResponseDTO } from "@schemas/category";
import { serializeCategory } from "@schemas/serializers";


export type CategoryUpdateProps = Pick<CategoryResponseDTO, "name" | "nameNormalized">;

export const saveCategoryChanges = async (
  category: ICategory,
  newProps: CategoryUpdateProps,
) => {
  Object.assign(category, newProps);
  await category.save();

  return serializeCategory(category);
}
