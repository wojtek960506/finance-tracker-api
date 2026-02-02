import { CategoryModel } from "@models/category-model";
import { CategoryResponseDTO } from "@schemas/category";
import { serializeCategory } from "@schemas/serializers";


export type CategoryCreateProps = Omit<CategoryResponseDTO, "id" >;

export const persistCategory = async (props: CategoryCreateProps) => {
  const newCategory = await CategoryModel.create(props);
  return serializeCategory(newCategory);
}
