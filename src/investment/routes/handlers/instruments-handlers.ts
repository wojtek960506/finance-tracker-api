import {
  InvestmentInstrumentDTO,
  InvestmentInstrumentFilterQuery,
  InvestmentInstrumentListResponseDTO,
  InvestmentInstrumentResponseDTO,
  InvestmentInstrumentUpdateDTO,
} from '@investment/schema';
import {
  createInstrument,
  deleteInstrument,
  getInstrumentById,
  getInstruments,
  updateInstrument,
} from '@investment/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const createInstrumentHandler = async (
  req: FastifyRequest<{ Body: InvestmentInstrumentDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: InvestmentInstrumentResponseDTO = await createInstrument(
    userId,
    req.body,
  );
  return res.code(201).send(result);
};

export const getInstrumentsHandler = async (
  req: FastifyRequest<{ Querystring: InvestmentInstrumentFilterQuery }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: InvestmentInstrumentListResponseDTO = await getInstruments(
    userId,
    req.query,
  );
  return res.code(200).send(result);
};

export const getInstrumentByIdHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: InvestmentInstrumentResponseDTO = await getInstrumentById(
    userId,
    req.params.id,
  );
  return res.code(200).send(result);
};

export const updateInstrumentHandler = async (
  req: FastifyRequest<{
    Params: ParamsJustId;
    Body: InvestmentInstrumentUpdateDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: InvestmentInstrumentResponseDTO = await updateInstrument(
    userId,
    req.params.id,
    req.body,
  );
  return res.code(200).send(result);
};

export const deleteInstrumentHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await deleteInstrument(userId, req.params.id);
  return res.code(200).send(result);
};
