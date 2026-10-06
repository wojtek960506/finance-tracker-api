import {
  VehicleFuelEntryListResponseDTO,
  VehicleFuelFilterQuery,
  VehicleParamsDTO,
} from '@vehicles/schema';
import { getFuelEntries } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getFuelEntriesHandler = async (
  req: FastifyRequest<{
    Params: VehicleParamsDTO;
    Querystring: VehicleFuelFilterQuery;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleFuelEntryListResponseDTO = (await getFuelEntries(
    userId,
    req.params.vehicleId,
    req.query,
  )) as VehicleFuelEntryListResponseDTO;
  return res.code(200).send(result);
};
