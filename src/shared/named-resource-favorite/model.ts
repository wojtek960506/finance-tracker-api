import { Document, model, Schema, Types } from 'mongoose';

import { FavoriteNamedResourceType } from './types';

export interface FavoriteNamedResourceAttributes {
  userId: Types.ObjectId;
  resourceId: Types.ObjectId;
  resourceType: FavoriteNamedResourceType;
}

export interface IFavoriteNamedResource
  extends FavoriteNamedResourceAttributes,
    Document {
  _id: Types.ObjectId;
}

const FavoriteNamedResourceSchema = new Schema<IFavoriteNamedResource>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resourceId: { type: Schema.Types.ObjectId, required: true, index: true },
    resourceType: {
      type: String,
      required: true,
      enum: ['account', 'category', 'paymentMethod'],
      index: true,
    },
  },
  { timestamps: true },
);

FavoriteNamedResourceSchema.index(
  { userId: 1, resourceType: 1, resourceId: 1 },
  { unique: true },
);

export const FavoriteNamedResourceModel = model<IFavoriteNamedResource>(
  'FavoriteNamedResource',
  FavoriteNamedResourceSchema,
);
