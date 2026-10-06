import {
  VehicleEquipmentParamsDTO,
  VehicleEquipmentResponseDTO,
  VehicleEquipmentUpdateDTO,
} from '@vehicles/schema';
import { updateEquipment } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const updateEquipmentHandler = async (
  req: FastifyRequest<{
    Params: VehicleEquipmentParamsDTO;
    Body: VehicleEquipmentUpdateDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleEquipmentResponseDTO = await updateEquipment(
    userId,
    req.params.vehicleId,
    req.params.itemId,
    req.body,
  );
  return res.code(200).send(result);
};
