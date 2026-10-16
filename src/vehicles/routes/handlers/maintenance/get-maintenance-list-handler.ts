import {
  VehicleMaintenanceFilterQuery,
  VehicleMaintenanceWithSummaryResponseDTO,
  VehicleParamsDTO,
} from '@vehicles/schema';
import { getMaintenanceList } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getMaintenanceListHandler = async (
  req: FastifyRequest<{
    Params: VehicleParamsDTO;
    Querystring: VehicleMaintenanceFilterQuery;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleMaintenanceWithSummaryResponseDTO = await getMaintenanceList(
    userId,
    req.params.vehicleId,
    req.query,
  );
  return res.code(200).send(result);
};
