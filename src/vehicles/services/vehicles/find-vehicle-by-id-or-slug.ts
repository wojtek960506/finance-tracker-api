import { IVehicle, VehicleModel } from '@vehicles/model';

import { OBJECT_ID_REGEX } from '@utils/consts';
import { VehicleNotFoundError } from '@utils/errors';

export const findVehicleByIdOrSlug = async (
  ownerId: string,
  identifier: string,
): Promise<IVehicle> => {
  const isObjectId = OBJECT_ID_REGEX.test(identifier);

  const vehicle = await VehicleModel.findOne({
    ownerId,
    ...(isObjectId ? { _id: identifier } : { slug: identifier }),
  });

  if (!vehicle) {
    throw new VehicleNotFoundError(identifier);
  }

  return vehicle;
};
