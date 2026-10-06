import { VehicleFuelEntryModel } from '@vehicles/model';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';

import { VehicleFuelEntryNotFoundError } from '@utils/errors';

export const deleteFuelEntry = async (
  ownerId: string,
  vehicleIdentifier: string,
  entryId: string,
): Promise<void> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const entry = await VehicleFuelEntryModel.findOne({
    _id: entryId,
    ownerId,
    vehicleId: vehicle._id,
  });

  if (!entry) {
    throw new VehicleFuelEntryNotFoundError(entryId);
  }

  await entry.deleteOne();
};
