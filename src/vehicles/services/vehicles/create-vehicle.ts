import { VehicleModel } from '@vehicles/model';
import { VehicleCreateDTO, VehicleResponseDTO } from '@vehicles/schema';
import { serializeVehicle } from '@vehicles/serializers';

import {
  VehicleNameAlreadyExistsError,
  VehicleSlugAlreadyExistsError,
} from '@utils/errors';

import { slugify } from './slugify';

export const createVehicle = async (
  ownerId: string,
  dto: VehicleCreateDTO,
): Promise<VehicleResponseDTO> => {
  const existingByName = await VehicleModel.findOne({ ownerId, name: dto.name });
  if (existingByName) {
    throw new VehicleNameAlreadyExistsError(dto.name);
  }

  const targetSlug = dto.slug || slugify(dto.name);
  const existingBySlug = await VehicleModel.findOne({ ownerId, slug: targetSlug });
  if (existingBySlug) {
    throw new VehicleSlugAlreadyExistsError(targetSlug);
  }

  const vehicle = await VehicleModel.create({
    ...dto,
    ownerId,
    slug: targetSlug,
  });

  return serializeVehicle(vehicle);
};
