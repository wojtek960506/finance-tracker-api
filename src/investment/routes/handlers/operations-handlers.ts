import {
  InvestmentOperationCreateDTO,
  InvestmentOperationListResponseDTO,
  InvestmentOperationResponseDTO,
  InvestmentOperationsQuery,
  InvestmentOperationUpdateDTO,
} from '@investment/schema';
import {
  createOperation,
  deleteOperation,
  getOperations,
  updateOperation,
} from '@investment/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const createOperationHandler = async (
  req: FastifyRequest<{ Body: InvestmentOperationCreateDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: InvestmentOperationResponseDTO = await createOperation(userId, req.body);
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

export const updateOperationHandler = async (
  req: FastifyRequest<{
    Params: ParamsJustId;
    Body: InvestmentOperationUpdateDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: InvestmentOperationResponseDTO = await updateOperation(
    userId,
    req.params.id,
    req.body,
  );
  return res.code(200).send(result);
};

export const deleteOperationHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await deleteOperation(userId, req.params.id);
  return res.code(200).send(result);
};
