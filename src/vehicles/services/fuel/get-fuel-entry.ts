import { VehicleFuelEntryModel } from '@vehicles/model';
import { VehicleFuelEntryEnrichedResponseDTO } from '@vehicles/schema';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';

import { VehicleFuelEntryNotFoundError } from '@utils/errors';

import { enrichFuelEntries } from './enrich-fuel-entries';

export const getFuelEntry = async (
  ownerId: string,
  vehicleIdentifier: string,
  entryId: string,
): Promise<VehicleFuelEntryEnrichedResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const rawEntries = await VehicleFuelEntryModel.find({
    ownerId,
    vehicleId: vehicle._id,
  }).sort({ date: 1, odometerKm: 1, _id: 1 });

  const enrichedList = enrichFuelEntries(rawEntries);
  const found = enrichedList.find((e) => e.id === entryId);

  if (!found) {
    throw new VehicleFuelEntryNotFoundError(entryId);
  }

  return found;
};
