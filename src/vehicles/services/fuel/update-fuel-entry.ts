import { VehicleFuelEntryModel } from '@vehicles/model';
import { VehicleFuelEntryResponseDTO, VehicleFuelEntryUpdateDTO } from '@vehicles/schema';
import { serializeFuelEntry } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';

import { VehicleFuelEntryNotFoundError } from '@utils/errors';

export const updateFuelEntry = async (
  ownerId: string,
  vehicleIdentifier: string,
  entryId: string,
  dto: VehicleFuelEntryUpdateDTO,
): Promise<VehicleFuelEntryResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const entry = await VehicleFuelEntryModel.findOne({
    _id: entryId,
    ownerId,
    vehicleId: vehicle._id,
  });

  if (!entry) {
    throw new VehicleFuelEntryNotFoundError(entryId);
  }

  Object.assign(entry, dto);
  await entry.save();

  return serializeFuelEntry(entry);
};
