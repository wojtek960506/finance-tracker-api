import { ICategory } from "@models/category-model";
import { CategoryResponseDTO } from "@schemas/category";


export const serializeCategory = (category: ICategory): CategoryResponseDTO => {
  const { _id, __v, ownerId, ...rest } = category.toObject();
  return {
    ...rest,
    id: _id.toString(),
    ownerId: ownerId ? ownerId.toString() : undefined
  };
}
