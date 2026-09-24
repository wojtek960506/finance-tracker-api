import {
  NetWorthIndependenceQuery,
  NetWorthIndependenceResponseDTO,
} from '@net-worth/schema';
import { getFinancialIndependence } from '@net-worth/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getFinancialIndependenceHandler = async (
  req: FastifyRequest<{ Querystring: NetWorthIndependenceQuery }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: NetWorthIndependenceResponseDTO = await getFinancialIndependence(
    userId,
    req.query,
  );
  return res.code(200).send(result);
};
