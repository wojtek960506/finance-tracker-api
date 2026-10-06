import { Document, model, Schema, Types } from 'mongoose';

import { MAINTENANCE_SECTIONS } from '../consts';
import { VehicleMaintenanceAttributes } from '../types';

export interface IVehicleMaintenance extends VehicleMaintenanceAttributes, Document {
  __v: number;
  _id: Types.ObjectId;
}

const vehicleMaintenanceSchema = new Schema<IVehicleMaintenance>(
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
    section: {
      type: String,
      required: true,
      enum: MAINTENANCE_SECTIONS,
    },
    date: {
      type: Date,
      required: true,
    },
    costPln: {
      type: Number,
      required: true,
      min: 0,
    },
    odometerKm: {
      type: Number,
      required: false,
      min: 0,
    },
    description: {
      type: String,
      required: false,
      maxlength: 1000,
    },
    serviceProvider: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200,
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

vehicleMaintenanceSchema.index(
  { ownerId: 1, vehicleId: 1, section: 1, sourceRow: 1 },
  { unique: true, sparse: true },
);
vehicleMaintenanceSchema.index({ ownerId: 1, vehicleId: 1, section: 1, date: -1 });
vehicleMaintenanceSchema.index({ ownerId: 1, transactionId: 1 }, { sparse: true });

export const VehicleMaintenanceModel = model<IVehicleMaintenance>(
  'VehicleMaintenance',
  vehicleMaintenanceSchema,
);
