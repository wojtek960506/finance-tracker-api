import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

import { SportStatsQueryDTO, SportStatsResponseDTO } from '../../schema';
import { getSportStats } from '../../services';

export const getSportStatsHandler = async (
  req: FastifyRequest<{
    Querystring: SportStatsQueryDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: SportStatsResponseDTO = await getSportStats(userId, req.query);
  return res.code(200).send(result);
};
