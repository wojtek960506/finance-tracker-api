import { VehicleModel } from '@vehicles/model';
import { VehicleResponseDTO, VehicleUpdateDTO } from '@vehicles/schema';
import { serializeVehicle } from '@vehicles/serializers';

import {
  VehicleNameAlreadyExistsError,
  VehicleSlugAlreadyExistsError,
} from '@utils/errors';

import { findVehicleByIdOrSlug } from './find-vehicle-by-id-or-slug';

export const updateVehicle = async (
  ownerId: string,
  identifier: string,
  dto: VehicleUpdateDTO,
): Promise<VehicleResponseDTO> => {
  const vehicle = await findVehicleByIdOrSlug(ownerId, identifier);

  if (dto.name && dto.name !== vehicle.name) {
    const existingByName = await VehicleModel.findOne({
      ownerId,
      name: dto.name,
      _id: { $ne: vehicle._id },
    });
    if (existingByName) {
      throw new VehicleNameAlreadyExistsError(dto.name);
    }
  }

  if (dto.slug && dto.slug !== vehicle.slug) {
    const existingBySlug = await VehicleModel.findOne({
      ownerId,
      slug: dto.slug,
      _id: { $ne: vehicle._id },
    });
    if (existingBySlug) {
      throw new VehicleSlugAlreadyExistsError(dto.slug);
    }
  }

  Object.assign(vehicle, dto);
  await vehicle.save();

  return serializeVehicle(vehicle);
};
