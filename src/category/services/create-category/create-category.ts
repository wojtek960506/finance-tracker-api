import { findCategoryByName, persistCategory } from '@category/db';
import { CategoryDTO, CategoryResponseDTO } from '@category/schema';
import { createNamedResource } from '@shared/named-resource';
import { CategoryAlreadyExistsError } from '@utils/errors';

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
