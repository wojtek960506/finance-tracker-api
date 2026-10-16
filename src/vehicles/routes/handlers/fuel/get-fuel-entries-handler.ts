import {
  VehicleFuelFilterQuery,
  VehicleFuelWithSummaryResponseDTO,
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
  const result: VehicleFuelWithSummaryResponseDTO = await getFuelEntries(
    userId,
    req.params.vehicleId,
    req.query,
  );
  return res.code(200).send(result);
};
