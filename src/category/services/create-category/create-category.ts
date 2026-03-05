import { CategoryType } from "@category/model";
import { normalizeWhitespace } from "@utils/strings";
import { CategoryAlreadyExistsError } from "@utils/errors";
import { findCategoryByName, persistCategory } from "@category/db";
import { CategoryDTO, CategoryResponseDTO } from "@category/schema";


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
