import { checkOwner } from "@services/general";
import { findCategoryById } from "@db/categories";
import { CategoryResponseDTO } from "@schemas/category";
import { serializeCategory } from "@schemas/serializers";


export const getCategory = async (
  categoryId: string,
  ownerId: string
): Promise<CategoryResponseDTO> => {
  const category = await findCategoryById(categoryId);
  if (category.type !== "system")
    checkOwner(ownerId, categoryId, category.ownerId!, "category");
  return serializeCategory(category);
}
