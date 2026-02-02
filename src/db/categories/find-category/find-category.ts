import { normalizeWhitespace } from "@utils/strings";
import { CategoryNotFoundError } from "@utils/errors";
import { CategoryModel } from "@models/category-model";


export const findCategoryById = async (id: string) => {
  const category = await CategoryModel.findById(id);
  if (!category) throw new CategoryNotFoundError(id);
  return category;
}

export const findCategoryByName = async (name: string) => {
  const category = await CategoryModel.find(
    { nameNormalized: normalizeWhitespace(name).toLowerCase() }
  );
  if (!category) throw new CategoryNotFoundError(undefined, name);
  return category[0];
}
