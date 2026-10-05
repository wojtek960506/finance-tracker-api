import { Document, model, Schema, Types } from 'mongoose';

import { VehicleEquipmentAttributes } from '../types';

export interface IVehicleEquipment extends VehicleEquipmentAttributes, Document {
  __v: number;
  _id: Types.ObjectId;
}

const vehicleEquipmentSchema = new Schema<IVehicleEquipment>(
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

vehicleEquipmentSchema.index(
  { ownerId: 1, vehicleId: 1, sourceRow: 1 },
  { unique: true, sparse: true },
);
vehicleEquipmentSchema.index({ ownerId: 1, vehicleId: 1, date: -1 });
vehicleEquipmentSchema.index({ ownerId: 1, transactionId: 1 }, { sparse: true });

export const VehicleEquipmentModel = model<IVehicleEquipment>(
  'VehicleEquipment',
  vehicleEquipmentSchema,
);
