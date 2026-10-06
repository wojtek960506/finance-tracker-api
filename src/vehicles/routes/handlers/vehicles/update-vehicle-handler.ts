import { VehicleParamsDTO, VehicleResponseDTO, VehicleUpdateDTO } from '@vehicles/schema';
import { updateVehicle } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const updateVehicleHandler = async (
  req: FastifyRequest<{
    Params: VehicleParamsDTO;
    Body: VehicleUpdateDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleResponseDTO = await updateVehicle(
    userId,
    req.params.vehicleId,
    req.body,
  );
  return res.code(200).send(result);
};
