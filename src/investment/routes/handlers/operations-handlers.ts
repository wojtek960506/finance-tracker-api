import {
  InvestmentOperationListResponseDTO,
  InvestmentOperationResponseDTO,
  InvestmentOperationsQuery,
  InvestmentSnapshotOperationDTO,
} from '@investment/schema';
import {
  createSnapshotOperation,
  deleteSnapshotOperation,
  getOperations,
} from '@investment/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const createSnapshotOperationHandler = async (
  req: FastifyRequest<{ Body: InvestmentSnapshotOperationDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: InvestmentOperationResponseDTO = await createSnapshotOperation(
    userId,
    req.body,
  );
  return res.code(201).send(result);
};

export const getOperationsHandler = async (
  req: FastifyRequest<{ Querystring: InvestmentOperationsQuery }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: InvestmentOperationListResponseDTO = await getOperations(
    userId,
    req.query,
  );
  return res.code(200).send(result);
};

export const deleteSnapshotOperationHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await deleteSnapshotOperation(userId, req.params.id);
  return res.code(200).send(result);
};
