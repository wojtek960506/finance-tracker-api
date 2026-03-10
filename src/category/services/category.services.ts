import {
  findCategories,
  findCategoryById,
  findCategoryByName,
  persistCategory,
  removeCategory,
  saveCategoryChanges,
} from '@category/db';
import { ICategory } from '@category/model';
import { CategoryDTO, CategoryResponseDTO } from '@category/schema';
import { serializeCategory } from '@category/serializers';
import {
  createNamedResource,
  deleteNamedResource,
  getNamedResource,
  prepareNamedResourcesMap,
  updateNamedResource,
} from '@shared/named-resource';
import { ITransaction } from '@transaction/model';
import { checkTransactionDependencies } from '@transaction/services';
import {
  CategoryAlreadyExistsError,
  SystemCategoryDeletionNotAllowed,
  SystemCategoryUpdateNotAllowed,
  UserCategoryMissingOwner,
} from '@utils/errors';

const checkOwnerType = 'category';

export const createCategory: (
  ownerId: string,
  dto: CategoryDTO,
) => Promise<CategoryResponseDTO> = createNamedResource<CategoryDTO, CategoryResponseDTO>(
  {
    findByName: findCategoryByName,
    persist: persistCategory,
    alreadyExistsErrorFactory: (name) => new CategoryAlreadyExistsError(name),
  },
);

export const getCategory = (categoryId: string, ownerId: string) => {
  return getNamedResource<ICategory, CategoryResponseDTO>({
    findById: findCategoryById,
    serialize: serializeCategory,
    checkOwnerType,
  })(categoryId, ownerId);
};

export const updateCategory = (categoryId: string, ownerId: string, dto: CategoryDTO) => {
  return updateNamedResource<ICategory, CategoryResponseDTO>({
    findById: findCategoryById,
    saveChanges: saveCategoryChanges,
    checkOwnerType,
    systemUpdateNotAllowedFactory: (resourceId) => {
      return new SystemCategoryUpdateNotAllowed(resourceId);
    },
    userMissingOwnerFactory: (resourceId) => {
      return new UserCategoryMissingOwner(resourceId);
    },
  })(categoryId, ownerId, dto);
};

export type CategoriesMap = Record<
  string,
  Pick<CategoryResponseDTO, 'id' | 'type' | 'name'>
>;

export const prepareCategoriesMap = async (
  ownerId: string,
  transactions?: Pick<ITransaction, 'categoryId'>[],
) => {
  const categoryIds = transactions?.map((t) => t.categoryId.toString());
  const categories = await findCategories(ownerId, categoryIds);
  return prepareNamedResourcesMap(categories);
};

export const deleteCategory = (categoryId: string, ownerId: string) => {
  return deleteNamedResource<ICategory>({
    findById: findCategoryById,
    remove: removeCategory,
    checkOwnerType,
    checkOccurrences: (id) => checkTransactionDependencies('categoryId', id),
    systemResourceDeleteErrorFactory: (id) => new SystemCategoryDeletionNotAllowed(id),
  })(categoryId, ownerId);
};
