import { CategoryModel } from "@models/category-model";


export const findCategories = async (
  ownerId?: string,
  categoryIds?: string[],
) => {
  
  type OwnerSystemType<T extends string | undefined> = [{ ownerId: T }, { type: 'system' } ];
  type Query = {
    $or?: OwnerSystemType<string>,
    $and?: OwnerSystemType<undefined>,
    _id?: { $in: string[] },
  }

  const query: Query = {};

  if (ownerId !== undefined) query.$or = [{ ownerId }, { type: 'system' }];
  else query.$and = [{ ownerId }, { type: 'system' }];

  if (categoryIds) query._id = { $in: categoryIds };

  return CategoryModel.find(query).lean();
}
