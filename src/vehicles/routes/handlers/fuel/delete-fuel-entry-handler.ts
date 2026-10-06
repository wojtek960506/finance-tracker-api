import { VehicleFuelEntryParamsDTO } from '@vehicles/schema';
import { deleteFuelEntry } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const deleteFuelEntryHandler = async (
  req: FastifyRequest<{ Params: VehicleFuelEntryParamsDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  await deleteFuelEntry(userId, req.params.vehicleId, req.params.entryId);
  return res.code(204).send();
};
