import { findCategoryById, saveCategoryChanges } from '@category/db';
import { ICategory } from '@category/model';
import { CategoryDTO, CategoryResponseDTO } from '@category/schema';
import { updateNamedResource } from '@shared/named-resource';
import { SystemCategoryUpdateNotAllowed, UserCategoryMissingOwner } from '@utils/errors';

export const updateCategory = (categoryId: string, ownerId: string, dto: CategoryDTO) => {
  return updateNamedResource<ICategory, CategoryResponseDTO>({
    findById: findCategoryById,
    saveChanges: saveCategoryChanges,
    ownerType: 'category',
    systemUpdateNotAllowedFactory: (resourceId) => {
      return new SystemCategoryUpdateNotAllowed(resourceId);
    },
    userMissingOwnerFactory: (resourceId) => {
      return new UserCategoryMissingOwner(resourceId);
    },
  })(categoryId, ownerId, dto);
};
