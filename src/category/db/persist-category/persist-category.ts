import { CategoryModel } from "@category/model";
import { CategoryResponseDTO } from "@category/schema";
import { serializeCategory } from "@schemas/serializers";


export type CategoryCreateProps = Omit<CategoryResponseDTO, "id" >;

export const persistCategory = async (props: CategoryCreateProps) => {
  const newCategory = await CategoryModel.create(props);
  return serializeCategory(newCategory);
}
