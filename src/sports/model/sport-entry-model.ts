import { Document, model, Schema, Types } from 'mongoose';

import {
  PopulatedSportCategory,
  SportCategoryField,
  SportEntryAttributes,
} from '../types';

export interface ISportEntry extends Omit<SportEntryAttributes, 'categoryId'>, Document {
  __v: number;
  _id: Types.ObjectId;
  categoryId: SportCategoryField;
}

export const isPopulatedCategory = (
  category: SportCategoryField,
): category is PopulatedSportCategory => {
  return typeof category === 'object' && category !== null && 'name' in category;
};

const sportEntrySchema = new Schema<ISportEntry>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'SportCategory',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    costPln: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: false,
      maxlength: 500,
      default: null,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      required: false,
      default: null,
    },
  },
  { timestamps: true },
);

sportEntrySchema.index({ ownerId: 1, date: -1 });
sportEntrySchema.index({ ownerId: 1, categoryId: 1 });
sportEntrySchema.index({ ownerId: 1, transactionId: 1 }, { sparse: true });

export const SportEntryModel = model<ISportEntry>('SportEntry', sportEntrySchema);
