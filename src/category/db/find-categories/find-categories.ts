import { CategoryModel } from '@category/model';
import { findNamedResources } from '@shared/named-resource';

export const findCategories = async (ownerId?: string, categoryIds?: string[]) => {
  return findNamedResources(CategoryModel, ownerId, categoryIds);
};
