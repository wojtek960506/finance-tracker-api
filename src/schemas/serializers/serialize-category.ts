import { FlattenMaps } from "mongoose";
import { ICategory } from "@models/category-model";
import { CategoryResponseDTO } from "@schemas/category";


export const serializeCategory = (
  category: FlattenMaps<ICategory>
): CategoryResponseDTO => {
  const { _id, ownerId, __v, ...rest } = category;
  return {
    ...rest,
    id: _id.toString(),
    ownerId: ownerId ? ownerId.toString() : undefined
  };
}
