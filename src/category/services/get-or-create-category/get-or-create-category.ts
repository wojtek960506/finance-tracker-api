import { findCategoryByName } from '@category/db';
import { serializeCategory } from '@category/serializers';
import { createCategory } from '@category/services';

export const getOrCreateCategory = async (ownerId: string, name: string) => {
  const category = await findCategoryByName(name, ownerId);
  if (category) return serializeCategory(category);
  return createCategory(ownerId, { name });
};
