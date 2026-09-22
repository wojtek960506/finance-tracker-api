import { NetWorthQuery, NetWorthResponseDTO } from '@net-worth/schema';
import { getNetWorth } from '@net-worth/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getNetWorthHandler = async (
  req: FastifyRequest<{ Querystring: NetWorthQuery }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: NetWorthResponseDTO = await getNetWorth(userId, req.query);
  return res.code(200).send(result);
};
