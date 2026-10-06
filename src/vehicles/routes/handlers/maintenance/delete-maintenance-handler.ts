import { VehicleMaintenanceParamsDTO } from '@vehicles/schema';
import { deleteMaintenance } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const deleteMaintenanceHandler = async (
  req: FastifyRequest<{ Params: VehicleMaintenanceParamsDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  await deleteMaintenance(userId, req.params.vehicleId, req.params.recordId);
  return res.code(204).send();
};
