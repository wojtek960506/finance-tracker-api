import { DeleteResult, Types } from 'mongoose';

import { FavoriteNamedResourceModel } from './model';
import { FavoriteNamedResourceType } from './types';

export const findFavoriteNamedResourceIds = async (
  userId: string,
  resourceType: FavoriteNamedResourceType,
) => {
  const favorites = await FavoriteNamedResourceModel.find({
    userId,
    resourceType,
  }).select({ _id: 0, resourceId: 1 });

  return favorites.map((favorite) => favorite.resourceId.toString());
};

export const persistFavoriteNamedResource = async (
  userId: string,
  resourceType: FavoriteNamedResourceType,
  resourceId: string,
) => {
  return FavoriteNamedResourceModel.findOneAndUpdate(
    {
      userId: new Types.ObjectId(userId),
      resourceType,
      resourceId: new Types.ObjectId(resourceId),
    },
    {},
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
};

export const removeFavoriteNamedResource = async (
  userId: string,
  resourceType: FavoriteNamedResourceType,
  resourceId: string,
): Promise<DeleteResult> => {
  return FavoriteNamedResourceModel.deleteOne({
    userId: new Types.ObjectId(userId),
    resourceType,
    resourceId: new Types.ObjectId(resourceId),
  });
};
