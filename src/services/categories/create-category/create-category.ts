import { normalizeWhitespace } from "@utils/strings";
import { CategoryType } from "@models/category-model";
import { CategoryAlreadyExistsError } from "@utils/errors";
import { CategoryDTO, CategoryResponseDTO } from "@schemas/category";
import { findCategoryByName, persistCategory } from "@db/categories";


export const createCategory = async (
  ownerId: string,
  dto: CategoryDTO,
): Promise<CategoryResponseDTO> => {
  const { name } = dto;
  try {
    const category = await findCategoryByName(name);
    if (category) throw new CategoryAlreadyExistsError(category.nameNormalized);
  } catch {}

  const props = {
    ownerId,
    type: "user" as CategoryType,
    name: normalizeWhitespace(name),
    nameNormalized: normalizeWhitespace(name).toLowerCase(),
  }
  return persistCategory(props);
}
