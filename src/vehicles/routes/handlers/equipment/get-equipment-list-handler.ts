import {
  VehicleEquipmentFilterQuery,
  VehicleEquipmentListResponseDTO,
  VehicleParamsDTO,
} from '@vehicles/schema';
import { getEquipmentList } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getEquipmentListHandler = async (
  req: FastifyRequest<{
    Params: VehicleParamsDTO;
    Querystring: VehicleEquipmentFilterQuery;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: VehicleEquipmentListResponseDTO = await getEquipmentList(
    userId,
    req.params.vehicleId,
    req.query,
  );
  return res.code(200).send(result);
};
