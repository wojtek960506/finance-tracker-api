import { DEFAULT_VEHICLES_LIMIT } from '@vehicles/consts';
import { VehicleFuelEntryModel } from '@vehicles/model';
import {
  VehicleFuelFilterQuery,
  VehicleFuelSummaryDTO,
  VehicleFuelWithSummaryResponseDTO,
} from '@vehicles/schema';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';
import { decodeCursor, encodeCursor } from '@vehicles/utils/cursor';

import { enrichFuelEntries } from './enrich-fuel-entries';

export const getFuelEntries = async (
  ownerId: string,
  vehicleIdentifier: string,
  query: Partial<VehicleFuelFilterQuery> = {},
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

  const isEnriched = query.enriched ?? true;
  if (!isEnriched) {
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

  let startIndex = 0;
  if (query.cursor) {
    const decoded = decodeCursor(query.cursor);
    if (decoded) {
      const exactIdx = reversed.findIndex((e) => e.id === decoded.id);
      if (exactIdx !== -1) {
        startIndex = exactIdx + 1;
      } else {
        const olderIdx = reversed.findIndex(
          (e) =>
            new Date(e.date) < decoded.date ||
            (new Date(e.date).getTime() === decoded.date.getTime() && e.id < decoded.id),
        );
        if (olderIdx !== -1) {
          startIndex = olderIdx;
        } else {
          startIndex = reversed.length;
        }
      }
    }
  }

  const limit = query.limit ?? DEFAULT_VEHICLES_LIMIT;
  const items = reversed.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < reversed.length;
  const lastItem = items[items.length - 1];
  const nextCursor =
    hasMore && lastItem ? encodeCursor(lastItem.date, lastItem.id) : null;

  return {
    items,
    summary,
    pagination: {
      nextCursor,
      hasMore,
      total: reversed.length,
    },
  };
};
