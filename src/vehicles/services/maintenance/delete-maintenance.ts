import { VehicleMaintenanceModel } from '@vehicles/model';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';

import { VehicleMaintenanceNotFoundError } from '@utils/errors';

export const deleteMaintenance = async (
  ownerId: string,
  vehicleIdentifier: string,
  maintenanceId: string,
): Promise<void> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const maintenance = await VehicleMaintenanceModel.findOne({
    _id: maintenanceId,
    ownerId,
    vehicleId: vehicle._id,
  });

  if (!maintenance) {
    throw new VehicleMaintenanceNotFoundError(maintenanceId);
  }

  await maintenance.deleteOne();
};
