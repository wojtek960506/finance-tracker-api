import { findCategoryByName } from "@db/categories";
import { createCategory } from "@services/categories";
import { serializeCategory } from "@schemas/serializers";


export const getOrCreateCategory = async (ownerId: string, name: string) => {
  const category = await findCategoryByName(name, ownerId);
  if (category) return serializeCategory(category);
  return createCategory(ownerId, { name });
}
