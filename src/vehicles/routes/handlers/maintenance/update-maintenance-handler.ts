import {
  VehicleMaintenanceParamsDTO,
  VehicleMaintenanceResponseDTO,
  VehicleMaintenanceUpdateDTO,
} from '@vehicles/schema';
import { updateMaintenance } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const updateMaintenanceHandler = async (
  req: FastifyRequest<{
    Params: VehicleMaintenanceParamsDTO;
    Body: VehicleMaintenanceUpdateDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleMaintenanceResponseDTO = await updateMaintenance(
    userId,
    req.params.vehicleId,
    req.params.recordId,
    req.body,
  );
  return res.code(200).send(result);
};
