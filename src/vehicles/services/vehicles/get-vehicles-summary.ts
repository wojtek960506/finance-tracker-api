import {
  VehicleEquipmentModel,
  VehicleFuelEntryModel,
  VehicleMaintenanceModel,
  VehicleModel,
} from '@vehicles/model';
import {
  VehicleSpendingSummaryDTO,
  VehiclesSummaryResponseDTO,
  VehicleWithSpendingDTO,
} from '@vehicles/schema';
import { serializeVehicle } from '@vehicles/serializers';
import { Types } from 'mongoose';

const roundCurrency = (val: number): number =>
  Math.round((val + Number.EPSILON) * 100) / 100;

interface FuelAggItem {
  _id: Types.ObjectId;
  fuelTotalPln: number;
  lastOdometerKm: number | null;
  firstOdometerKm: number | null;
  fuelEntriesCount: number;
}

interface MaintenanceAggItem {
  _id: Types.ObjectId;
  maintenanceTotalPln: number;
  lastOdometerKm: number | null;
  firstOdometerKm: number | null;
  maintenanceCount: number;
}

interface EquipmentAggItem {
  _id: Types.ObjectId;
  equipmentTotalPln: number;
  equipmentCount: number;
}

export const getVehiclesSummary = async (
  ownerId: string,
): Promise<VehiclesSummaryResponseDTO> => {
  const ownerObjectId = new Types.ObjectId(ownerId);

  const [vehicles, fuelAgg, maintenanceAgg, equipmentAgg] = await Promise.all([
    VehicleModel.find({ ownerId: ownerObjectId }).sort({ createdAt: 1 }),
    VehicleFuelEntryModel.aggregate<FuelAggItem>([
      { $match: { ownerId: ownerObjectId } },
      {
        $group: {
          _id: '$vehicleId',
          fuelTotalPln: { $sum: '$costPln' },
          lastOdometerKm: { $max: '$odometerKm' },
          firstOdometerKm: { $min: '$odometerKm' },
          fuelEntriesCount: { $sum: 1 },
        },
      },
    ]),
    VehicleMaintenanceModel.aggregate<MaintenanceAggItem>([
      { $match: { ownerId: ownerObjectId } },
      {
        $group: {
          _id: '$vehicleId',
          maintenanceTotalPln: {
            $sum: {
              $cond: [{ $eq: ['$section', 'ownMaintenance'] }, '$costPln', 0],
            },
          },
          lastOdometerKm: {
            $max: {
              $cond: [{ $eq: ['$section', 'ownMaintenance'] }, '$odometerKm', null],
            },
          },
          firstOdometerKm: {
            $min: {
              $cond: [{ $eq: ['$section', 'ownMaintenance'] }, '$odometerKm', null],
            },
          },
          maintenanceCount: { $sum: 1 },
        },
      },
    ]),
    VehicleEquipmentModel.aggregate<EquipmentAggItem>([
      { $match: { ownerId: ownerObjectId } },
      {
        $group: {
          _id: '$vehicleId',
          equipmentTotalPln: { $sum: '$costPln' },
          equipmentCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const fuelMap = new Map<string, FuelAggItem>();
  for (const item of fuelAgg) {
    fuelMap.set(item._id.toString(), item);
  }

  const maintenanceMap = new Map<string, MaintenanceAggItem>();
  for (const item of maintenanceAgg) {
    maintenanceMap.set(item._id.toString(), item);
  }

  const equipmentMap = new Map<string, EquipmentAggItem>();
  for (const item of equipmentAgg) {
    equipmentMap.set(item._id.toString(), item);
  }

  let totalFuelSpentPln = 0;
  let totalMaintenanceSpentPln = 0;
  let totalEquipmentSpentPln = 0;
  let totalDistanceKm = 0;

  const vehiclesWithSpending: VehicleWithSpendingDTO[] = vehicles.map((vehicle) => {
    const vIdStr = vehicle._id.toString();
    const fuel = fuelMap.get(vIdStr);
    const maint = maintenanceMap.get(vIdStr);
    const equip = equipmentMap.get(vIdStr);

    const fuelTotalPln = roundCurrency(fuel?.fuelTotalPln ?? 0);
    const maintenanceTotalPln = roundCurrency(maint?.maintenanceTotalPln ?? 0);
    const equipmentTotalPln = roundCurrency(equip?.equipmentTotalPln ?? 0);
    const totalSpentPln = roundCurrency(
      fuelTotalPln + maintenanceTotalPln + equipmentTotalPln,
    );

    const fuelOdometer = fuel?.lastOdometerKm ?? null;
    const maintOdometer = maint?.lastOdometerKm ?? null;
    let lastOdometerKm: number | null = null;
    if (fuelOdometer !== null && maintOdometer !== null) {
      lastOdometerKm = Math.max(fuelOdometer, maintOdometer);
    } else if (fuelOdometer !== null) {
      lastOdometerKm = fuelOdometer;
    } else if (maintOdometer !== null) {
      lastOdometerKm = maintOdometer;
    }

    const fuelMinOdometer = fuel?.firstOdometerKm ?? null;
    const maintMinOdometer = maint?.firstOdometerKm ?? null;
    let minOdometerKm: number | null = null;
    if (fuelMinOdometer !== null && maintMinOdometer !== null) {
      minOdometerKm = Math.min(fuelMinOdometer, maintMinOdometer);
    } else if (fuelMinOdometer !== null) {
      minOdometerKm = fuelMinOdometer;
    } else if (maintMinOdometer !== null) {
      minOdometerKm = maintMinOdometer;
    }

    const vehicleDistanceKm =
      lastOdometerKm !== null && minOdometerKm !== null
        ? Math.max(0, lastOdometerKm - minOdometerKm)
        : null;

    const spending: VehicleSpendingSummaryDTO = {
      fuelTotalPln,
      maintenanceTotalPln,
      equipmentTotalPln,
      totalSpentPln,
      lastOdometerKm,
      totalDistanceKm: vehicleDistanceKm,
      fuelEntriesCount: fuel?.fuelEntriesCount ?? 0,
      maintenanceCount: maint?.maintenanceCount ?? 0,
      equipmentCount: equip?.equipmentCount ?? 0,
    };

    totalFuelSpentPln += fuelTotalPln;
    totalMaintenanceSpentPln += maintenanceTotalPln;
    totalEquipmentSpentPln += equipmentTotalPln;
    if (vehicleDistanceKm !== null) {
      totalDistanceKm += vehicleDistanceKm;
    }

    return {
      ...serializeVehicle(vehicle),
      spending,
    };
  });

  const totalSpentPln = roundCurrency(
    totalFuelSpentPln + totalMaintenanceSpentPln + totalEquipmentSpentPln,
  );

  return {
    summary: {
      totalVehicles: vehicles.length,
      totalSpentPln,
      totalFuelSpentPln: roundCurrency(totalFuelSpentPln),
      totalMaintenanceSpentPln: roundCurrency(totalMaintenanceSpentPln),
      totalEquipmentSpentPln: roundCurrency(totalEquipmentSpentPln),
      totalDistanceKm,
    },
    vehicles: vehiclesWithSpending,
  };
};
