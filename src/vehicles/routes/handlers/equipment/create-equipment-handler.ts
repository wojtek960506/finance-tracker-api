import {
  VehicleEquipmentCreateDTO,
  VehicleEquipmentResponseDTO,
  VehicleParamsDTO,
} from '@vehicles/schema';
import { createEquipment } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const createEquipmentHandler = async (
  req: FastifyRequest<{
    Params: VehicleParamsDTO;
    Body: VehicleEquipmentCreateDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleEquipmentResponseDTO = await createEquipment(
    userId,
    req.params.vehicleId,
    req.body,
  );
  return res.code(201).send(result);
};
