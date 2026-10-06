import {
  VehicleMaintenanceParamsDTO,
  VehicleMaintenanceResponseDTO,
} from '@vehicles/schema';
import { getMaintenance } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getMaintenanceItemHandler = async (
  req: FastifyRequest<{ Params: VehicleMaintenanceParamsDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleMaintenanceResponseDTO = await getMaintenance(
    userId,
    req.params.vehicleId,
    req.params.recordId,
  );
  return res.code(200).send(result);
};
