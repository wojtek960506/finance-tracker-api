import { findCategoryByName } from "@category/db"
import { createCategory } from "@category/services"
import { serializeCategory } from "@category/serializers"


export const getOrCreateCategory = async (ownerId: string, name: string) => {
  const category = await findCategoryByName(name, ownerId);
  if (category) return serializeCategory(category);
  return createCategory(ownerId, { name });
}
