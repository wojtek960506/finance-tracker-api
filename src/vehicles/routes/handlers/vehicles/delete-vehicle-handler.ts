import { VehicleParamsDTO } from '@vehicles/schema';
import { deleteVehicle } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const deleteVehicleHandler = async (
  req: FastifyRequest<{ Params: VehicleParamsDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  await deleteVehicle(userId, req.params.vehicleId);
  return res.code(204).send();
};
