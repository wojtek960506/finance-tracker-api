import { normalizeWhitespace } from "@utils/strings";
import { CategoryType } from "@models/category-model";
import { CategoryDTO, CategoryResponseDTO } from "@schemas/category";
import { findCategoryByName, persistCategory } from "@db/categories";
import { CategoryAlreadyExistsError, CategoryNotFoundError } from "@utils/errors";


export const createCategory = async (
  ownerId: string,
  dto: CategoryDTO,
): Promise<CategoryResponseDTO> => {
  const { name } = dto;
  try {
    const category = await findCategoryByName(name);
    if (category) throw new CategoryAlreadyExistsError(category.nameNormalized);
  } catch (error) {
    // when category not found then it means that it can be created with given name
    if (!(error instanceof CategoryNotFoundError)) throw error;
  }

  const props = {
    ownerId,
    type: "user" as CategoryType,
    name: normalizeWhitespace(name),
    nameNormalized: normalizeWhitespace(name).toLowerCase(),
  }
  return persistCategory(props);
}
