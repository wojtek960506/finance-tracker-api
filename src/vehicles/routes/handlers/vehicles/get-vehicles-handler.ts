import { VehicleListResponseDTO } from '@vehicles/schema';
import { getVehicles } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getVehiclesHandler = async (req: FastifyRequest, res: FastifyReply) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleListResponseDTO = await getVehicles(userId);
  return res.code(200).send(result);
};
