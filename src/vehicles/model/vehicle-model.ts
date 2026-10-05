import { Document, model, Schema, Types } from 'mongoose';

import { VEHICLE_TYPES } from '../consts';
import { VehicleAttributes } from '../types';

export interface IVehicle extends VehicleAttributes, Document {
  __v: number;
  _id: Types.ObjectId;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    brand: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50,
    },
    vehicleModel: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50,
    },
    type: {
      type: String,
      required: true,
      enum: VEHICLE_TYPES,
    },
    productionYear: {
      type: Number,
      required: false,
      min: 1900,
      max: 2100,
    },
    notes: {
      type: String,
      required: false,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);

vehicleSchema.index({ ownerId: 1, slug: 1 }, { unique: true });
vehicleSchema.index({ ownerId: 1, name: 1 });

export const VehicleModel = model<IVehicle>('Vehicle', vehicleSchema);
