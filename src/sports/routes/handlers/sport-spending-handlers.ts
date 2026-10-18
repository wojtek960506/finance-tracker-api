import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

import {
  LinkSportSpendingsToTransactionDTO,
  SportSpendingLinkResponseDTO,
  UnlinkSportSpendingFromTransactionDTO,
} from '../../schema';
import {
  linkSportSpendingsToTransaction,
  unlinkSportSpendingFromTransaction,
} from '../../services';

export const linkSportSpendingsHandler = async (
  req: FastifyRequest<{
    Body: LinkSportSpendingsToTransactionDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: SportSpendingLinkResponseDTO = await linkSportSpendingsToTransaction(
    userId,
    req.body,
  );
  return res.code(200).send(result);
};

export const unlinkSportSpendingHandler = async (
  req: FastifyRequest<{
    Body: UnlinkSportSpendingFromTransactionDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: SportSpendingLinkResponseDTO = await unlinkSportSpendingFromTransaction(
    userId,
    req.body,
  );
  return res.code(200).send(result);
};
