import {
  VehicleEquipmentModel,
  VehicleFuelEntryModel,
  VehicleMaintenanceModel,
} from '@vehicles/model';
import {
  VehicleOverviewActivityItemDTO,
  VehicleOverviewQueryDTO,
  VehicleOverviewResponseDTO,
} from '@vehicles/schema';

import { enrichFuelEntries } from '../fuel/enrich-fuel-entries';

import { findVehicleByIdOrSlug } from './find-vehicle-by-id-or-slug';

const roundCurrency = (val: number): number =>
  Math.round((val + Number.EPSILON) * 100) / 100;

export const getVehicleOverview = async (
  ownerId: string,
  vehicleIdentifier: string,
  query: VehicleOverviewQueryDTO = { activityLimit: 10 },
): Promise<VehicleOverviewResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);
  const vehicleId = vehicle._id;

  const [rawFuelEntries, maintenanceEntries, equipmentEntries] = await Promise.all([
    VehicleFuelEntryModel.find({ ownerId, vehicleId }).sort({
      date: 1,
      odometerKm: 1,
      _id: 1,
    }),
    VehicleMaintenanceModel.find({
      ownerId,
      vehicleId,
      section: 'ownMaintenance',
    }).sort({
      date: -1,
      _id: -1,
    }),
    VehicleEquipmentModel.find({ ownerId, vehicleId }).sort({
      date: -1,
      _id: -1,
    }),
  ]);

  const enrichedFuelEntries = enrichFuelEntries(rawFuelEntries);

  // 1. Fuel calculations
  let totalFuelSpentPln = 0;
  let totalFuelLiters = 0;
  for (const f of rawFuelEntries) {
    totalFuelSpentPln += f.costPln;
    totalFuelLiters += f.fuelLiters;
  }

  const validConsumptions = enrichedFuelEntries
    .map((e) => e.consumptionLPer100Km)
    .filter((c): c is number => typeof c === 'number' && c > 0);

  const avgConsumptionLPer100Km =
    validConsumptions.length > 0
      ? Math.round(
          (validConsumptions.reduce((acc, c) => acc + c, 0) / validConsumptions.length) *
            100,
        ) / 100
      : null;

  const validCostPerKms = enrichedFuelEntries
    .map((e) => e.costPerKmPln)
    .filter((c): c is number => typeof c === 'number' && c > 0);

  const costPerKmPln =
    validCostPerKms.length > 0
      ? Math.round(
          (validCostPerKms.reduce((acc, c) => acc + c, 0) / validCostPerKms.length) * 100,
        ) / 100
      : null;

  // 2. Maintenance calculations (strictly ownMaintenance)
  let totalMaintenanceSpentPln = 0;
  let totalMaintenanceCount = 0;

  for (const m of maintenanceEntries) {
    totalMaintenanceSpentPln += m.costPln;
    totalMaintenanceCount += 1;
  }

  // 3. Equipment calculations
  let totalEquipmentSpentPln = 0;
  let totalEquipmentCount = 0;
  for (const eq of equipmentEntries) {
    totalEquipmentSpentPln += eq.costPln;
    totalEquipmentCount += 1;
  }

  // 4. Vehicle stats (odometers & counts)
  // Per business rules: only fuel and ownMaintenance odometers are considered
  const activeOdometers: number[] = [
    ...rawFuelEntries
      .map((f) => f.odometerKm)
      .filter((o): o is number => typeof o === 'number' && o > 0),
    ...maintenanceEntries
      .filter((m) => typeof m.odometerKm === 'number' && m.odometerKm > 0)
      .map((m) => m.odometerKm as number),
  ];

  let currentOdometerKm: number | null = null;
  let minOdometerKm: number | null = null;
  let totalDistanceKm: number | null = null;

  if (activeOdometers.length > 0) {
    currentOdometerKm = Math.max(...activeOdometers);
    minOdometerKm = Math.min(...activeOdometers);
    totalDistanceKm = Math.max(0, currentOdometerKm - minOdometerKm);
  }

  // 5. Total Spent PLN (fuel + ownMaintenance + equipment)
  const totalSpentPln = roundCurrency(
    totalFuelSpentPln + totalMaintenanceSpentPln + totalEquipmentSpentPln,
  );

  // 6. Recent activity feed
  const fuelActivities: VehicleOverviewActivityItemDTO[] = enrichedFuelEntries.map(
    (entry) => ({
      id: entry.id,
      type: 'fuel',
      date: entry.date,
      costPln: entry.costPln,
      title: entry.stationBrand || 'Refueling',
      ...(entry.description ? { description: entry.description } : {}),
      odometerKm: entry.odometerKm,
      transactionId: entry.transactionId ?? null,
      fuelLiters: entry.fuelLiters,
      isFullTank: entry.isFullTank,
      consumptionLPer100Km: entry.consumptionLPer100Km ?? null,
    }),
  );

  const maintenanceActivities: VehicleOverviewActivityItemDTO[] = maintenanceEntries.map(
    (entry) => ({
      id: entry._id.toString(),
      type: 'maintenance',
      date: entry.date,
      costPln: entry.costPln,
      title: entry.serviceProvider || entry.description || 'Maintenance',
      ...(entry.description ? { description: entry.description } : {}),
      odometerKm: entry.odometerKm ?? null,
      transactionId: entry.transactionId ? entry.transactionId.toString() : null,
      maintenanceSection: entry.section,
      ...(entry.serviceProvider ? { serviceProvider: entry.serviceProvider } : {}),
    }),
  );

  const equipmentActivities: VehicleOverviewActivityItemDTO[] = equipmentEntries.map(
    (entry) => ({
      id: entry._id.toString(),
      type: 'equipment',
      date: entry.date,
      costPln: entry.costPln,
      title: entry.itemName,
      ...(entry.description ? { description: entry.description } : {}),
      transactionId: entry.transactionId ? entry.transactionId.toString() : null,
    }),
  );

  const limit = query.activityLimit ?? 10;
  const recentActivity = [
    ...fuelActivities,
    ...maintenanceActivities,
    ...equipmentActivities,
  ]
    .sort((a, b) => {
      const timeDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (timeDiff !== 0) return timeDiff;
      return b.id.localeCompare(a.id);
    })
    .slice(0, limit);

  return {
    vehicleId: vehicleId.toString(),
    totalSpentPln,
    fuel: {
      totalSpentPln: roundCurrency(totalFuelSpentPln),
      totalLiters: Math.round(totalFuelLiters * 100) / 100,
      avgConsumptionLPer100Km,
      costPerKmPln,
      entriesCount: rawFuelEntries.length,
    },
    maintenance: {
      totalSpentPln: roundCurrency(totalMaintenanceSpentPln),
      entriesCount: totalMaintenanceCount,
    },
    equipment: {
      totalSpentPln: roundCurrency(totalEquipmentSpentPln),
      entriesCount: totalEquipmentCount,
    },
    stats: {
      currentOdometerKm,
      minOdometerKm,
      totalDistanceKm,
      refuelingCount: rawFuelEntries.length,
      maintenanceCount: totalMaintenanceCount,
      equipmentCount: totalEquipmentCount,
    },
    recentActivity,
  };
};
