import { VehicleEquipmentParamsDTO } from '@vehicles/schema';
import { deleteEquipment } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const deleteEquipmentHandler = async (
  req: FastifyRequest<{ Params: VehicleEquipmentParamsDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  await deleteEquipment(userId, req.params.vehicleId, req.params.itemId);
  return res.code(204).send();
};
