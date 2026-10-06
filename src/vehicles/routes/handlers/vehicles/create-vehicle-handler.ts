import { VehicleCreateDTO, VehicleResponseDTO } from '@vehicles/schema';
import { createVehicle } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const createVehicleHandler = async (
  req: FastifyRequest<{ Body: VehicleCreateDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleResponseDTO = await createVehicle(userId, req.body);
  return res.code(201).send(result);
};
