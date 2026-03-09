import { CategoryModel } from '@category/model';
import { findNamedResourceById, findNamedResourceByName } from '@shared/named-resource';
import { CategoryNotFoundError } from '@utils/errors';

export const findCategoryById = async (id: string) => {
  return findNamedResourceById(CategoryModel, id, (categoryId) => {
    return new CategoryNotFoundError(categoryId);
  });
};

export const findCategoryByName = async (name: string, ownerId?: string) => {
  return findNamedResourceByName(CategoryModel, name, ownerId);
};
