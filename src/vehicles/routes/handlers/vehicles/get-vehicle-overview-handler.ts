import {
  VehicleOverviewQueryDTO,
  VehicleOverviewResponseDTO,
  VehicleParamsDTO,
} from '@vehicles/schema';
import { getVehicleOverview } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getVehicleOverviewHandler = async (
  req: FastifyRequest<{
    Params: VehicleParamsDTO;
    Querystring: VehicleOverviewQueryDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleOverviewResponseDTO = await getVehicleOverview(
    userId,
    req.params.vehicleId,
    req.query,
  );
  return res.code(200).send(result);
};
