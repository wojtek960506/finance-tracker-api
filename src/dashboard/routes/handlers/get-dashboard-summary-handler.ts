import { DashboardSummaryQuery, DashboardSummaryResponseDTO } from '@dashboard/schema';
import { getDashboardSummary } from '@dashboard/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getDashboardSummaryHandler = async (
  req: FastifyRequest<{ Querystring: DashboardSummaryQuery }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: DashboardSummaryResponseDTO = await getDashboardSummary(
    userId,
    req.query,
  );
  return res.code(200).send(result);
};
