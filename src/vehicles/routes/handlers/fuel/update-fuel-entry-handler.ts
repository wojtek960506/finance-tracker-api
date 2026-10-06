import {
  VehicleFuelEntryParamsDTO,
  VehicleFuelEntryResponseDTO,
  VehicleFuelEntryUpdateDTO,
} from '@vehicles/schema';
import { updateFuelEntry } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const updateFuelEntryHandler = async (
  req: FastifyRequest<{
    Params: VehicleFuelEntryParamsDTO;
    Body: VehicleFuelEntryUpdateDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleFuelEntryResponseDTO = await updateFuelEntry(
    userId,
    req.params.vehicleId,
    req.params.entryId,
    req.body,
  );
  return res.code(200).send(result);
};
