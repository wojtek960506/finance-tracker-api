import { VehicleEquipmentParamsDTO, VehicleEquipmentResponseDTO } from '@vehicles/schema';
import { getEquipment } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getEquipmentItemHandler = async (
  req: FastifyRequest<{ Params: VehicleEquipmentParamsDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleEquipmentResponseDTO = await getEquipment(
    userId,
    req.params.vehicleId,
    req.params.itemId,
  );
  return res.code(200).send(result);
};
