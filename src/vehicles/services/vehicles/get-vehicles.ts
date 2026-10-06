import { VehicleModel } from '@vehicles/model';
import { VehicleResponseDTO } from '@vehicles/schema';
import { serializeVehicle } from '@vehicles/serializers';

import { findVehicleByIdOrSlug } from './find-vehicle-by-id-or-slug';

export const getVehicles = async (ownerId: string): Promise<VehicleResponseDTO[]> => {
  const vehicles = await VehicleModel.find({ ownerId }).sort({ createdAt: 1 });
  return vehicles.map(serializeVehicle);
};

export const getVehicle = async (
  ownerId: string,
  identifier: string,
): Promise<VehicleResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, identifier);
  return serializeVehicle(vehicle);
};
