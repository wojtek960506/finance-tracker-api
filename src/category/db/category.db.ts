import { CategoryModel, ICategory } from '@category/model';
import { CategoryResponseDTO } from '@category/schema';
import { serializeCategory } from '@category/serializers';
import {
  findNamedResourceById,
  findNamedResourceByName,
  findNamedResources,
  NamedResourceCreateProps,
  NamedResourceUpdateProps,
  persistNamedResource,
  saveNamedResourceChanges,
} from '@shared/named-resource';
import { CategoryNotFoundError } from '@utils/errors';

export type CategoryCreateProps = NamedResourceCreateProps &
  Omit<CategoryResponseDTO, 'id'>;

export type CategoryUpdateProps = NamedResourceUpdateProps &
  Pick<CategoryResponseDTO, 'name' | 'nameNormalized'>;

export const findCategoryById = async (id: string) => {
  return findNamedResourceById(CategoryModel, id, (categoryId) => {
    return new CategoryNotFoundError(categoryId);
  });
};

export const findCategoryByName = async (name: string, ownerId?: string) => {
  return findNamedResourceByName(CategoryModel, name, ownerId);
};

export const findCategories = async (ownerId?: string, categoryIds?: string[]) => {
  return findNamedResources(CategoryModel, ownerId, categoryIds);
};

export const persistCategory = async (props: CategoryCreateProps) => {
  return persistNamedResource(CategoryModel, props, serializeCategory);
};

export const saveCategoryChanges = async (
  category: ICategory,
  newProps: CategoryUpdateProps,
) => {
  return saveNamedResourceChanges(category, newProps, serializeCategory);
};
