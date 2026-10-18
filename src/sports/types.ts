import { Types } from 'mongoose';

import { INamedResource, NamedResourceType } from '@named-resource';

export interface PopulatedSportCategory {
  _id: Types.ObjectId;
  name: string;
  type: NamedResourceType;
}

export type SportCategoryField = Types.ObjectId | PopulatedSportCategory | INamedResource;

export interface SportEntryAttributes {
  ownerId: Types.ObjectId;
  categoryId: Types.ObjectId;
  date: Date;
  itemName: string;
  costPln: number;
  description?: string | null;
  transactionId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}
