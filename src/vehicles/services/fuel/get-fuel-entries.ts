import { IVehicleFuelEntry, VehicleFuelEntryModel } from '@vehicles/model';
import {
  VehicleFuelEntryEnrichedResponseDTO,
  VehicleFuelEntryResponseDTO,
  VehicleFuelFilterQuery,
} from '@vehicles/schema';
import { serializeFuelEntry } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';
import { FilterQuery } from 'mongoose';

import { enrichFuelEntries } from './enrich-fuel-entries';

export const getFuelEntries = async (
  ownerId: string,
  vehicleIdentifier: string,
  query: VehicleFuelFilterQuery = {
    page: 1,
    limit: 20,
    enriched: true,
  },
): Promise<(VehicleFuelEntryEnrichedResponseDTO | VehicleFuelEntryResponseDTO)[]> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  if (!query.enriched) {
    const filter: FilterQuery<IVehicleFuelEntry> = {
      ownerId,
      vehicleId: vehicle._id,
    };

    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = query.startDate;
      if (query.endDate) filter.date.$lte = query.endDate;
    }

    if (query.isFullTank !== undefined) {
      filter.isFullTank = query.isFullTank;
    }

    const rawEntries = await VehicleFuelEntryModel.find(filter)
      .sort({ date: -1, odometerKm: -1, _id: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit);

    return rawEntries.map(serializeFuelEntry);
  }

  const rawEntries = await VehicleFuelEntryModel.find({
    ownerId,
    vehicleId: vehicle._id,
  }).sort({ date: 1, odometerKm: 1, _id: 1 });

  let enrichedList = enrichFuelEntries(rawEntries);

  if (query.startDate) {
    enrichedList = enrichedList.filter((e) => new Date(e.date) >= query.startDate!);
  }

  if (query.endDate) {
    enrichedList = enrichedList.filter((e) => new Date(e.date) <= query.endDate!);
  }

  if (query.isFullTank !== undefined) {
    enrichedList = enrichedList.filter((e) => e.isFullTank === query.isFullTank);
  }

  // Sort newest first
  enrichedList.reverse();

  const offset = (query.page - 1) * query.limit;
  return enrichedList.slice(offset, offset + query.limit);
};
