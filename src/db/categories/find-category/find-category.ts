import { normalizeWhitespace } from "@utils/strings";
import { CategoryNotFoundError } from "@utils/errors";
import { CategoryModel } from "@models/category-model";


export const findCategoryById = async (id: string) => {
  const category = await CategoryModel.findById(id);
  if (!category) throw new CategoryNotFoundError(id);
  return category;
}

export const findCategoryByName = async (
  name: string,
  ownerId?: string,
) => {
  return CategoryModel.findOne({
    nameNormalized: normalizeWhitespace(name).toLowerCase(),
    $or: [ 
      { type: "system" },
      { type: "user", ownerId },
    ]
  });
}
