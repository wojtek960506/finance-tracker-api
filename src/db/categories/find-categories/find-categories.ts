import { CategoryModel } from "@models/category-model";
import { serializeCategory } from "@schemas/serializers";
import { CategoriesResponseDTO } from "@schemas/category";


export const findCategories = async (
  ownerId?: string
): Promise<CategoriesResponseDTO> => {
  const result = await CategoryModel.find({
    $or: [{ ownerId }, { type: "system" }]
  });
  return result.map(c => serializeCategory(c));
}
