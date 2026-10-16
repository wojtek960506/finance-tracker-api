import { VehiclesSummaryResponseDTO } from '@vehicles/schema';
import { getVehiclesSummary } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getVehiclesSummaryHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehiclesSummaryResponseDTO = await getVehiclesSummary(userId);
  return res.code(200).send(result);
};
