import { findCategoryById } from '@category/db';
import { ICategory } from '@category/model';
import { CategoryResponseDTO } from '@category/schema';
import { serializeCategory } from '@category/serializers';
import { getNamedResource } from '@shared/named-resource';

export const getCategory = (categoryId: string, ownerId: string) => {
  return getNamedResource<ICategory, CategoryResponseDTO>({
    findById: findCategoryById,
    serialize: serializeCategory,
    ownerType: 'category',
  })(categoryId, ownerId);
};
