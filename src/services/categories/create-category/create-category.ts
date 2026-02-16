import { normalizeWhitespace } from "@utils/strings";
import { CategoryType } from "@models/category-model";
import { CategoryDTO, CategoryResponseDTO } from "@schemas/category";
import { findCategoryByName, persistCategory } from "@db/categories";
import { CategoryAlreadyExistsError } from "@utils/errors";


export const createCategory = async (
  ownerId: string,
  dto: CategoryDTO,
): Promise<CategoryResponseDTO> => {
  const { name } = dto;
  
  const category = await findCategoryByName(name, ownerId);
  if (category) throw new CategoryAlreadyExistsError(name);

  const props = {
    ownerId,
    type: "user" as CategoryType,
    name: normalizeWhitespace(name),
    nameNormalized: normalizeWhitespace(name).toLowerCase(),
  }
  return persistCategory(props);
}
