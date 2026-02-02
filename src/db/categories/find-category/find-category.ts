import { CategoryNotFoundError } from "@utils/errors";
import { CategoryModel } from "@models/category-model";


export const findCategory = async (id: string) => {
  const category = await CategoryModel.findById(id);
  if (!category) throw new CategoryNotFoundError(id);
  return category;
}
