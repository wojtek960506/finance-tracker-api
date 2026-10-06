import { VehicleParamsDTO, VehicleResponseDTO } from '@vehicles/schema';
import { getVehicle } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getVehicleHandler = async (
  req: FastifyRequest<{ Params: VehicleParamsDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleResponseDTO = await getVehicle(userId, req.params.vehicleId);
  return res.code(200).send(result);
};
