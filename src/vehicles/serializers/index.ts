import {
  IVehicle,
  IVehicleEquipment,
  IVehicleFuelEntry,
  IVehicleMaintenance,
} from '../model';
import {
  VehicleEquipmentResponseDTO,
  VehicleFuelEntryEnrichedResponseDTO,
  VehicleFuelEntryResponseDTO,
  VehicleMaintenanceResponseDTO,
  VehicleResponseDTO,
} from '../schema';
import { VehicleFuelEntryEnrichedMetrics } from '../types';

export const serializeVehicle = (vehicle: IVehicle): VehicleResponseDTO => ({
  id: vehicle._id.toString(),
  ownerId: vehicle.ownerId.toString(),
  slug: vehicle.slug,
  name: vehicle.name,
  brand: vehicle.brand,
  vehicleModel: vehicle.vehicleModel,
  type: vehicle.type,
  productionYear: vehicle.productionYear,
  notes: vehicle.notes,
  createdAt: vehicle.createdAt,
  updatedAt: vehicle.updatedAt,
});

export const serializeFuelEntry = (
  entry: IVehicleFuelEntry,
): VehicleFuelEntryResponseDTO => ({
  id: entry._id.toString(),
  ownerId: entry.ownerId.toString(),
  vehicleId: entry.vehicleId.toString(),
  sourceRow: entry.sourceRow,
  date: entry.date,
  fuelLiters: entry.fuelLiters,
  isFullTank: entry.isFullTank,
  unitPricePln: entry.unitPricePln,
  costPln: entry.costPln,
  odometerKm: entry.odometerKm,
  stationBrand: entry.stationBrand,
  stationAddress: entry.stationAddress,
  description: entry.description,
  transactionId: entry.transactionId ? entry.transactionId.toString() : null,
  createdAt: entry.createdAt,
  updatedAt: entry.updatedAt,
});

export const serializeEnrichedFuelEntry = (
  entry: IVehicleFuelEntry,
  metrics: VehicleFuelEntryEnrichedMetrics,
): VehicleFuelEntryEnrichedResponseDTO => ({
  ...serializeFuelEntry(entry),
  ...metrics,
});

export const serializeEquipment = (
  equipment: IVehicleEquipment,
): VehicleEquipmentResponseDTO => ({
  id: equipment._id.toString(),
  ownerId: equipment.ownerId.toString(),
  vehicleId: equipment.vehicleId.toString(),
  sourceRow: equipment.sourceRow,
  date: equipment.date,
  itemName: equipment.itemName,
  costPln: equipment.costPln,
  description: equipment.description,
  transactionId: equipment.transactionId ? equipment.transactionId.toString() : null,
  createdAt: equipment.createdAt,
  updatedAt: equipment.updatedAt,
});

export const serializeMaintenance = (
  maintenance: IVehicleMaintenance,
): VehicleMaintenanceResponseDTO => ({
  id: maintenance._id.toString(),
  ownerId: maintenance.ownerId.toString(),
  vehicleId: maintenance.vehicleId.toString(),
  sourceRow: maintenance.sourceRow,
  section: maintenance.section,
  date: maintenance.date,
  costPln: maintenance.costPln,
  odometerKm: maintenance.odometerKm,
  description: maintenance.description,
  serviceProvider: maintenance.serviceProvider,
  transactionId: maintenance.transactionId ? maintenance.transactionId.toString() : null,
  createdAt: maintenance.createdAt,
  updatedAt: maintenance.updatedAt,
});
