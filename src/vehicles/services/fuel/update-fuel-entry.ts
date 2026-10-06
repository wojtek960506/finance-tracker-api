import { VehicleFuelEntryModel } from '@vehicles/model';
import { VehicleFuelEntryResponseDTO, VehicleFuelEntryUpdateDTO } from '@vehicles/schema';
import { serializeFuelEntry } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';

import { VehicleFuelEntryNotFoundError } from '@utils/errors';

import { validateOdometerSequence } from './validate-odometer-sequence';

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

  if (dto.date !== undefined || dto.odometerKm !== undefined) {
    const targetDate = dto.date ? new Date(dto.date) : entry.date;
    const targetOdometer =
      dto.odometerKm !== undefined ? dto.odometerKm : entry.odometerKm;

    await validateOdometerSequence({
      ownerId,
      vehicleId: vehicle._id,
      targetDate,
      odometerKm: targetOdometer,
      excludeEntryId: entry._id,
    });
  }

  Object.assign(entry, dto);
  await entry.save();

  return serializeFuelEntry(entry);
};
