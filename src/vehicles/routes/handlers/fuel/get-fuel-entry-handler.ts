import { VehicleFuelEntryParamsDTO, VehicleFuelEntryResponseDTO } from '@vehicles/schema';
import { getFuelEntry } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getFuelEntryHandler = async (
  req: FastifyRequest<{ Params: VehicleFuelEntryParamsDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleFuelEntryResponseDTO = await getFuelEntry(
    userId,
    req.params.vehicleId,
    req.params.entryId,
  );
  return res.code(200).send(result);
};
