import { InvestmentSummaryQuery, InvestmentSummaryResponseDTO } from '@investment/schema';
import { getInvestmentSummary } from '@investment/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getInvestmentSummaryHandler = async (
  req: FastifyRequest<{ Querystring: InvestmentSummaryQuery }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: InvestmentSummaryResponseDTO = await getInvestmentSummary(
    userId,
    req.query,
  );
  return res.code(200).send(result);
};
