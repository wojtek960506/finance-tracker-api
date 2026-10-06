import { Types } from 'mongoose';

import { MAINTENANCE_SECTIONS, SPENDING_TYPES, VEHICLE_TYPES } from './consts';

export type VehicleType = (typeof VEHICLE_TYPES)[number];
export type MaintenanceSection = (typeof MAINTENANCE_SECTIONS)[number];
export type SpendingType = (typeof SPENDING_TYPES)[number];

export interface VehicleAttributes {
  ownerId: Types.ObjectId;
  slug: string;
  name: string;
  brand?: string;
  vehicleModel?: string;
  type: VehicleType;
  productionYear?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleFuelEntryAttributes {
  ownerId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  sourceRow?: number;
  date: Date;
  fuelLiters: number;
  isFullTank: boolean;
  unitPricePln: number;
  costPln: number;
  odometerKm: number;
  stationBrand?: string;
  stationAddress?: string;
  description?: string;
  transactionId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleFuelEntryEnrichedMetrics {
  distanceSincePreviousKm: number | null;
  distanceSincePreviousFullKm: number | null;
  fuelLitersToFull: number | null;
  costToFullPln: number | null;
  consumptionLPer100Km: number | null;
  costPerKmPln: number | null;
  kmPerLiter: number | null;
}

export interface VehicleEquipmentAttributes {
  ownerId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  sourceRow?: number;
  date: Date;
  itemName: string;
  costPln: number;
  description?: string;
  transactionId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleMaintenanceAttributes {
  ownerId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  sourceRow?: number;
  section: MaintenanceSection;
  date: Date;
  costPln: number;
  odometerKm?: number;
  description?: string;
  serviceProvider?: string;
  transactionId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}
