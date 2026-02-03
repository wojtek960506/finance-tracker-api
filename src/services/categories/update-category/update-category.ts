import { checkOwner } from "@services/general";
import { normalizeWhitespace } from "@utils/strings";
import { CategoryDTO, CategoryResponseDTO } from "@schemas/category";
import { findCategoryById, saveCategoryChanges } from "@db/categories";
import { SystemCategoryUpdateNotAllowed, UserCategoryMissingOwner } from "@utils/errors";


export const updateCategory = async (
  categoryId: string,
  ownerId: string,
  dto: CategoryDTO
): Promise<CategoryResponseDTO> => {
  const category = await findCategoryById(categoryId);
  if (category.type === "system")
    throw new SystemCategoryUpdateNotAllowed(categoryId);
  if (!category.ownerId)
    throw new UserCategoryMissingOwner(categoryId);
  checkOwner(ownerId, categoryId, category.ownerId!, "category");

  const { name } = dto;
  const newProps = {
    name: normalizeWhitespace(name),
    nameNormalized: normalizeWhitespace(name).toLowerCase(),
  }

  return saveCategoryChanges(category, newProps);
}