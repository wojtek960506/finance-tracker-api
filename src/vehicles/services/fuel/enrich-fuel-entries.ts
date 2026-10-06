import { IVehicleFuelEntry } from '@vehicles/model';
import { VehicleFuelEntryEnrichedResponseDTO } from '@vehicles/schema';
import { serializeEnrichedFuelEntry } from '@vehicles/serializers';
import { VehicleFuelEntryEnrichedMetrics } from '@vehicles/types';

export const enrichFuelEntries = (
  sortedEntries: IVehicleFuelEntry[],
): VehicleFuelEntryEnrichedResponseDTO[] => {
  let lastOdometer: number | null = null;
  let lastFullTankOdometer: number | null = null;
  let accumulatedLiters = 0;
  let accumulatedCost = 0;

  return sortedEntries.map((entry) => {
    const distanceSincePreviousKm =
      lastOdometer !== null && entry.odometerKm >= lastOdometer
        ? entry.odometerKm - lastOdometer
        : null;

    accumulatedLiters += entry.fuelLiters;
    accumulatedCost += entry.costPln;

    let distanceSincePreviousFullKm: number | null = null;
    let fuelLitersToFull: number | null = null;
    let costToFullPln: number | null = null;
    let consumptionLPer100Km: number | null = null;
    let costPerKmPln: number | null = null;
    let kmPerLiter: number | null = null;

    if (entry.isFullTank) {
      if (lastFullTankOdometer !== null && entry.odometerKm > lastFullTankOdometer) {
        distanceSincePreviousFullKm = entry.odometerKm - lastFullTankOdometer;
        fuelLitersToFull = Math.round(accumulatedLiters * 100) / 100;
        costToFullPln = Math.round(accumulatedCost * 100) / 100;

        consumptionLPer100Km =
          Math.round((accumulatedLiters / distanceSincePreviousFullKm) * 100 * 100) / 100;
        costPerKmPln =
          Math.round((accumulatedCost / distanceSincePreviousFullKm) * 100) / 100;
        kmPerLiter =
          Math.round((distanceSincePreviousFullKm / accumulatedLiters) * 100) / 100;
      }

      lastFullTankOdometer = entry.odometerKm;
      accumulatedLiters = 0;
      accumulatedCost = 0;
    }

    lastOdometer = entry.odometerKm;

    const metrics: VehicleFuelEntryEnrichedMetrics = {
      distanceSincePreviousKm,
      distanceSincePreviousFullKm,
      fuelLitersToFull,
      costToFullPln,
      consumptionLPer100Km,
      costPerKmPln,
      kmPerLiter,
    };

    return serializeEnrichedFuelEntry(entry, metrics);
  });
};
