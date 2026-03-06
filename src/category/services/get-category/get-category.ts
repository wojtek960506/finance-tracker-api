import { checkOwner } from "@shared/services";
import { findCategoryById } from "@category/db";
import { CategoryResponseDTO } from "@category/schema";
import { serializeCategory } from "@category/serializers";


export const getCategory = async (
  categoryId: string,
  ownerId: string
): Promise<CategoryResponseDTO> => {
  const category = await findCategoryById(categoryId);
  if (category.type !== "system")
    checkOwner(ownerId, categoryId, category.ownerId!, "category");
  return serializeCategory(category);
}
