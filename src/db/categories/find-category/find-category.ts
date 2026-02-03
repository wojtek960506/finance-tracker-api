import { normalizeWhitespace } from "@utils/strings";
import { CategoryNotFoundError } from "@utils/errors";
import { CategoryModel } from "@models/category-model";
import { serializeCategory } from "@schemas/serializers";


export const findCategoryById = async (id: string) => {
  const category = await CategoryModel.findById(id);
  if (!category) throw new CategoryNotFoundError(id);
  return category;
}

export const findCategoryByName = async (name: string) => {
  const categoriesByName = await CategoryModel.find(
    { nameNormalized: normalizeWhitespace(name).toLowerCase() }
  );
  if (!categoriesByName) throw new CategoryNotFoundError(undefined, name);
  return serializeCategory(categoriesByName[0]);
}
