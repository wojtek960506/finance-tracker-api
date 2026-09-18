import { InvestmentSummaryResponseDTO } from '@investment/schema';
import { getInvestmentSummary } from '@investment/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const getInvestmentSummaryHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: InvestmentSummaryResponseDTO = await getInvestmentSummary(userId);
  return res.code(200).send(result);
};
