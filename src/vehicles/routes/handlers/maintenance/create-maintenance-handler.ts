import {
  VehicleMaintenanceCreateDTO,
  VehicleMaintenanceResponseDTO,
  VehicleParamsDTO,
} from '@vehicles/schema';
import { createMaintenance } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const createMaintenanceHandler = async (
  req: FastifyRequest<{
    Params: VehicleParamsDTO;
    Body: VehicleMaintenanceCreateDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleMaintenanceResponseDTO = await createMaintenance(
    userId,
    req.params.vehicleId,
    req.body,
  );
  return res.code(201).send(result);
};
