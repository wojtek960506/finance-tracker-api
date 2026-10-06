import {
  IVehicle,
  VehicleEquipmentModel,
  VehicleFuelEntryModel,
  VehicleMaintenanceModel,
  VehicleModel,
} from '@vehicles/model';
import { MaintenanceSection, SpendingType, VehicleType } from '@vehicles/types';
import { Types } from 'mongoose';

export interface VehicleDocInput {
  _id?: Types.ObjectId;
  ownerId: Types.ObjectId;
  slug?: string;
  name?: string;
  brand?: string;
  vehicleModel?: string;
  type?: VehicleType;
  productionYear?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const buildVehicleDoc = ({
  _id = new Types.ObjectId(),
  ownerId,
  slug = 'suzuki-sv-650',
  name = 'Suzuki SV650',
  brand = 'Suzuki',
  vehicleModel = 'SV650',
  type = 'motorcycle',
  productionYear = 2007,
  notes = 'Test vehicle notes',
  createdAt = new Date('2026-01-01T00:00:00.000Z'),
  updatedAt = new Date('2026-01-01T00:00:00.000Z'),
}: VehicleDocInput) => ({
  _id,
  ownerId,
  slug,
  name,
  brand,
  vehicleModel,
  type,
  productionYear,
  notes,
  createdAt,
  updatedAt,
});

export const insertVehicles = async (vehicles: ReturnType<typeof buildVehicleDoc>[]) =>
  VehicleModel.insertMany(vehicles);

export const createIntegrationVehicle = async (
  overrides: Partial<VehicleDocInput> = {},
): Promise<IVehicle> => {
  const ownerId = overrides.ownerId ?? new Types.ObjectId();
  const doc = buildVehicleDoc({
    ...overrides,
    ownerId,
  });

  return (await VehicleModel.create(doc)) as IVehicle;
};

export interface FuelEntryDocInput {
  _id?: Types.ObjectId;
  ownerId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  sourceRow?: number;
  date?: Date;
  fuelLiters?: number;
  isFullTank?: boolean;
  unitPricePln?: number;
  costPln?: number;
  odometerKm?: number;
  stationBrand?: string;
  stationAddress?: string;
  description?: string;
  transactionId?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

let fuelSourceRowSeq = 1;
let maintenanceSourceRowSeq = 1;
let equipmentSourceRowSeq = 1;

export const buildFuelEntryDoc = ({
  _id = new Types.ObjectId(),
  ownerId,
  vehicleId,
  sourceRow = fuelSourceRowSeq++,
  date = new Date('2026-01-15T00:00:00.000Z'),
  fuelLiters = 14.5,
  isFullTank = true,
  unitPricePln = 6.5,
  costPln = 94.25,
  odometerKm = 15000,
  stationBrand = 'Orlen',
  stationAddress = 'Warszawa, ul. Testowa 1',
  description = 'Regular refueling',
  transactionId = null,
  createdAt = new Date('2026-01-15T00:00:00.000Z'),
  updatedAt = new Date('2026-01-15T00:00:00.000Z'),
}: FuelEntryDocInput) => ({
  _id,
  ownerId,
  vehicleId,
  sourceRow,
  date,
  fuelLiters,
  isFullTank,
  unitPricePln,
  costPln,
  odometerKm,
  stationBrand,
  stationAddress,
  description,
  transactionId,
  createdAt,
  updatedAt,
});

export const insertFuelEntries = async (
  entries: ReturnType<typeof buildFuelEntryDoc>[],
) => VehicleFuelEntryModel.insertMany(entries);

export interface MaintenanceDocInput {
  _id?: Types.ObjectId;
  ownerId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  sourceRow?: number;
  section?: MaintenanceSection;
  date?: Date;
  costPln?: number;
  odometerKm?: number;
  description?: string;
  serviceProvider?: string;
  transactionId?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export const buildMaintenanceDoc = ({
  _id = new Types.ObjectId(),
  ownerId,
  vehicleId,
  sourceRow = maintenanceSourceRowSeq++,
  section = 'own_maintenance',
  date = new Date('2026-02-01T00:00:00.000Z'),
  costPln = 350,
  odometerKm = 16000,
  description = 'Oil and filter replacement',
  serviceProvider = 'Moto Workshop',
  transactionId = null,
  createdAt = new Date('2026-02-01T00:00:00.000Z'),
  updatedAt = new Date('2026-02-01T00:00:00.000Z'),
}: MaintenanceDocInput) => ({
  _id,
  ownerId,
  vehicleId,
  sourceRow,
  section,
  date,
  costPln,
  odometerKm,
  description,
  serviceProvider,
  transactionId,
  createdAt,
  updatedAt,
});

export const insertMaintenanceRecords = async (
  records: ReturnType<typeof buildMaintenanceDoc>[],
) => VehicleMaintenanceModel.insertMany(records);

export interface EquipmentDocInput {
  _id?: Types.ObjectId;
  ownerId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  sourceRow?: number;
  date?: Date;
  itemName?: string;
  costPln?: number;
  description?: string;
  transactionId?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export const buildEquipmentDoc = ({
  _id = new Types.ObjectId(),
  ownerId,
  vehicleId,
  sourceRow = equipmentSourceRowSeq++,
  date = new Date('2026-02-05T00:00:00.000Z'),
  itemName = 'Crash bars',
  costPln = 450,
  description = 'Engine guard protection',
  transactionId = null,
  createdAt = new Date('2026-02-05T00:00:00.000Z'),
  updatedAt = new Date('2026-02-05T00:00:00.000Z'),
}: EquipmentDocInput) => ({
  _id,
  ownerId,
  vehicleId,
  sourceRow,
  date,
  itemName,
  costPln,
  description,
  transactionId,
  createdAt,
  updatedAt,
});

export const insertEquipmentItems = async (
  items: ReturnType<typeof buildEquipmentDoc>[],
) => VehicleEquipmentModel.insertMany(items);

export interface SpendingLinkInput {
  spendingType: SpendingType;
  spendingId: Types.ObjectId;
  transactionId: Types.ObjectId;
  ownerId?: Types.ObjectId;
}

export const buildSpendingLinkDoc = ({
  spendingType = 'fuel',
  spendingId = new Types.ObjectId(),
  transactionId = new Types.ObjectId(),
  ownerId = new Types.ObjectId(),
}: Partial<SpendingLinkInput> = {}) => ({
  spendingType,
  spendingId,
  transactionId,
  ownerId,
});

export const insertSpendingLinks = async (
  links: Array<{
    spendingType: SpendingType;
    spendingId: Types.ObjectId;
    transactionId: Types.ObjectId;
    ownerId?: Types.ObjectId;
  }>,
) => {
  for (const link of links) {
    const filter = link.ownerId
      ? { _id: link.spendingId, ownerId: link.ownerId }
      : { _id: link.spendingId };

    if (link.spendingType === 'fuel') {
      await VehicleFuelEntryModel.updateOne(filter, {
        $set: { transactionId: link.transactionId },
      });
    } else if (link.spendingType === 'maintenance') {
      await VehicleMaintenanceModel.updateOne(filter, {
        $set: { transactionId: link.transactionId },
      });
    } else if (link.spendingType === 'equipment') {
      await VehicleEquipmentModel.updateOne(filter, {
        $set: { transactionId: link.transactionId },
      });
    }
  }
};
