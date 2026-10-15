import { VehicleFuelEntryModel } from '@vehicles/model';
import {
  VehicleFuelFilterQuery,
  VehicleFuelSummaryDTO,
  VehicleFuelWithSummaryResponseDTO,
} from '@vehicles/schema';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';

import { enrichFuelEntries } from './enrich-fuel-entries';

export const getFuelEntries = async (
  ownerId: string,
  vehicleIdentifier: string,
  query: VehicleFuelFilterQuery = {
    page: 1,
    limit: 20,
    enriched: true,
  },
): Promise<VehicleFuelWithSummaryResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const rawEntries = await VehicleFuelEntryModel.find({
    ownerId,
    vehicleId: vehicle._id,
  }).sort({ date: 1, odometerKm: 1, _id: 1 });

  let filtered = enrichFuelEntries(rawEntries);

  if (query.startDate) {
    filtered = filtered.filter((e) => new Date(e.date) >= query.startDate!);
  }

  if (query.endDate) {
    filtered = filtered.filter((e) => new Date(e.date) <= query.endDate!);
  }

  if (query.isFullTank !== undefined) {
    filtered = filtered.filter((e) => e.isFullTank === query.isFullTank);
  }

  // Summary computed across all filtered entries (before pagination)
  let totalVolume = 0;
  let totalCostPln = 0;
  for (const entry of filtered) {
    totalVolume += entry.fuelLiters;
    totalCostPln += entry.costPln;
  }
  totalVolume = Math.round((totalVolume + Number.EPSILON) * 100) / 100;
  totalCostPln = Math.round((totalCostPln + Number.EPSILON) * 100) / 100;

  const validConsumptions = filtered
    .map((e) => e.consumptionLPer100Km)
    .filter((c): c is number => typeof c === 'number' && c > 0);

  const avgConsumptionLPer100Km =
    validConsumptions.length > 0
      ? Math.round(
          (validConsumptions.reduce((acc, c) => acc + c, 0) / validConsumptions.length +
            Number.EPSILON) *
            100,
        ) / 100
      : null;

  const avgUnitPricePln =
    totalVolume > 0
      ? Math.round((totalCostPln / totalVolume + Number.EPSILON) * 100) / 100
      : null;

  const summary: VehicleFuelSummaryDTO = {
    totalVolume,
    totalCostPln,
    avgConsumptionLPer100Km,
    avgUnitPricePln,
    totalCount: filtered.length,
  };

  // Sort newest first
  let reversed = [...filtered].reverse();

  if (!query.enriched) {
    reversed = reversed.map((item) => ({
      ...item,
      distanceSincePreviousKm: null,
      distanceSincePreviousFullKm: null,
      fuelLitersToFull: null,
      costToFullPln: null,
      consumptionLPer100Km: null,
      costPerKmPln: null,
      kmPerLiter: null,
    }));
  }

  const offset = (query.page - 1) * query.limit;
  const items = reversed.slice(offset, offset + query.limit);

  return {
    items,
    summary,
  };
};
