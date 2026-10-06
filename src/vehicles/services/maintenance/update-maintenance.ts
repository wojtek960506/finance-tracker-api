import { VehicleMaintenanceModel } from '@vehicles/model';
import {
  VehicleMaintenanceResponseDTO,
  VehicleMaintenanceUpdateDTO,
} from '@vehicles/schema';
import { serializeMaintenance } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';

import { VehicleMaintenanceNotFoundError } from '@utils/errors';

export const updateMaintenance = async (
  ownerId: string,
  vehicleIdentifier: string,
  maintenanceId: string,
  dto: VehicleMaintenanceUpdateDTO,
): Promise<VehicleMaintenanceResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const maintenance = await VehicleMaintenanceModel.findOne({
    _id: maintenanceId,
    ownerId,
    vehicleId: vehicle._id,
  });

  if (!maintenance) {
    throw new VehicleMaintenanceNotFoundError(maintenanceId);
  }

  Object.assign(maintenance, dto);
  await maintenance.save();

  return serializeMaintenance(maintenance);
};
