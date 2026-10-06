import {
  VehicleFuelEntryCreateDTO,
  VehicleFuelEntryResponseDTO,
  VehicleParamsDTO,
} from '@vehicles/schema';
import { createFuelEntry } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const createFuelEntryHandler = async (
  req: FastifyRequest<{
    Params: VehicleParamsDTO;
    Body: VehicleFuelEntryCreateDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleFuelEntryResponseDTO = await createFuelEntry(
    userId,
    req.params.vehicleId,
    req.body,
  );
  return res.code(201).send(result);
};
