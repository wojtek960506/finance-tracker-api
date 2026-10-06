import { VehicleMaintenanceModel } from '@vehicles/model';
import {
  VehicleMaintenanceCreateDTO,
  VehicleMaintenanceResponseDTO,
} from '@vehicles/schema';
import { serializeMaintenance } from '@vehicles/serializers';
import { findVehicleByIdOrSlug } from '@vehicles/services/vehicles/find-vehicle-by-id-or-slug';

export const createMaintenance = async (
  ownerId: string,
  vehicleIdentifier: string,
  dto: VehicleMaintenanceCreateDTO,
): Promise<VehicleMaintenanceResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, vehicleIdentifier);

  const maintenance = await VehicleMaintenanceModel.create({
    ...dto,
    ownerId,
    vehicleId: vehicle._id,
  });

  return serializeMaintenance(maintenance);
};
