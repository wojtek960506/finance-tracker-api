import { VehicleFuelEntryModel } from '@vehicles/model';
import { VehicleFuelEntryCreateDTO, VehicleFuelEntryResponseDTO } from '@vehicles/schema';
import { serializeFuelEntry } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';

import { validateOdometerSequence } from './validate-odometer-sequence';

export const createFuelEntry = async (
  ownerId: string,
  vehicleIdentifier: string,
  dto: VehicleFuelEntryCreateDTO,
): Promise<VehicleFuelEntryResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  await validateOdometerSequence({
    ownerId,
    vehicleId: vehicle._id,
    targetDate: new Date(dto.date),
    odometerKm: dto.odometerKm,
  });

  const fuelEntry = await VehicleFuelEntryModel.create({
    ...dto,
    ownerId,
    vehicleId: vehicle._id,
  });

  return serializeFuelEntry(fuelEntry);
};
