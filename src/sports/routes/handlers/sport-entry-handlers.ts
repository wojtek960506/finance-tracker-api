import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

import {
  SportEntryCreateDTO,
  SportEntryFilterQueryDTO,
  SportEntryListResponseDTO,
  SportEntryParamsDTO,
  SportEntryResponseDTO,
  SportEntryUpdateDTO,
} from '../../schema';
import {
  createSportEntry,
  deleteSportEntry,
  getSportEntry,
  listSportEntries,
  updateSportEntry,
} from '../../services';

export const createSportEntryHandler = async (
  req: FastifyRequest<{
    Body: SportEntryCreateDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: SportEntryResponseDTO = await createSportEntry(userId, req.body);
  return res.code(201).send(result);
};

export const listSportEntriesHandler = async (
  req: FastifyRequest<{
    Querystring: SportEntryFilterQueryDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: SportEntryListResponseDTO = await listSportEntries(userId, req.query);
  return res.code(200).send(result);
};

export const getSportEntryHandler = async (
  req: FastifyRequest<{
    Params: SportEntryParamsDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: SportEntryResponseDTO = await getSportEntry(userId, req.params.id);
  return res.code(200).send(result);
};

export const updateSportEntryHandler = async (
  req: FastifyRequest<{
    Params: SportEntryParamsDTO;
    Body: SportEntryUpdateDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: SportEntryResponseDTO = await updateSportEntry(
    userId,
    req.params.id,
    req.body,
  );
  return res.code(200).send(result);
};

export const deleteSportEntryHandler = async (
  req: FastifyRequest<{
    Params: SportEntryParamsDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  await deleteSportEntry(userId, req.params.id);
  return res.code(204).send();
};
