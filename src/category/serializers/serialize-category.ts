import { ICategory } from '@category/model';
import { CategoryResponseDTO } from '@category/schema';

export const serializeCategory = (category: ICategory): CategoryResponseDTO => {
  const { _id, ownerId, __v, ...rest } = category.toObject();
  return {
    ...rest,
    id: _id.toString(),
    ownerId: ownerId ? ownerId.toString() : undefined,
  };
};
