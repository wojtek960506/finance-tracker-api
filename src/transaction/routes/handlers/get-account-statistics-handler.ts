import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';
import { TransactionAccountStatisticsQuery } from '@transaction/schema';
import { getAccountStatistics } from '@transaction/services';

export async function getAccountStatisticsHandler(
  req: FastifyRequest<{ Querystring: TransactionAccountStatisticsQuery }>,
  res: FastifyReply,
) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getAccountStatistics(req.query, userId);
  return res.code(200).send(result);
}
