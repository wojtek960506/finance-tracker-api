import { Document, model, Schema, Types } from 'mongoose';

import { VehicleFuelEntryAttributes } from '../types';

export interface IVehicleFuelEntry extends VehicleFuelEntryAttributes, Document {
  __v: number;
  _id: Types.ObjectId;
}

const vehicleFuelEntrySchema = new Schema<IVehicleFuelEntry>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    sourceRow: {
      type: Number,
      required: false,
      min: 1,
    },
    date: {
      type: Date,
      required: true,
    },
    fuelLiters: {
      type: Number,
      required: true,
      min: 0.001,
    },
    isFullTank: {
      type: Boolean,
      required: true,
      default: true,
    },
    unitPricePln: {
      type: Number,
      required: true,
      min: 0,
    },
    costPln: {
      type: Number,
      required: true,
      min: 0,
    },
    odometerKm: {
      type: Number,
      required: true,
      min: 0,
    },
    stationBrand: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100,
    },
    stationAddress: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: false,
      maxlength: 500,
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

vehicleFuelEntrySchema.index(
  { ownerId: 1, vehicleId: 1, sourceRow: 1 },
  { unique: true, sparse: true },
);
vehicleFuelEntrySchema.index({ ownerId: 1, vehicleId: 1, date: -1, odometerKm: -1 });
vehicleFuelEntrySchema.index({ ownerId: 1, transactionId: 1 }, { sparse: true });

export const VehicleFuelEntryModel = model<IVehicleFuelEntry>(
  'VehicleFuelEntry',
  vehicleFuelEntrySchema,
);
