import { FastifyReply, FastifyRequest } from 'fastify';

import {
  createNamedResource,
  deleteNamedResource,
  getNamedResource,
  listNamedResources,
  updateNamedResource,
} from '@named-resource/services';
import { NameDTO } from '@named-resource/services/types';
import { NamedResourceKind } from '@named-resource/types';
import {
  favoriteNamedResource,
  getFavoriteNamedResources,
  unfavoriteNamedResource,
} from '@named-resource-favorite/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { NamedResourceDTO, NamedResourceResponseDTO } from '@shared/named-resource';

type NamedResourceBodyByKind = {
  account: NamedResourceDTO;
  category: NamedResourceDTO;
  paymentMethod: NamedResourceDTO;
};

type NamedResourceResponseByKind = {
  account: NamedResourceResponseDTO;
  category: NamedResourceResponseDTO;
  paymentMethod: NamedResourceResponseDTO;
};

export const getNamedResourcesHandler =
  <TKind extends NamedResourceKind>(kind: TKind) =>
  async (req: FastifyRequest, res: FastifyReply) => {
    const userId = (req as AuthenticatedRequest).userId;
    const result = await listNamedResources<NamedResourceResponseByKind[TKind]>(
      kind,
      userId,
    );

    return res.code(200).send(result);
  };

export const getFavoriteNamedResourcesHandler =
  <TKind extends NamedResourceKind>(kind: TKind) =>
  async (req: FastifyRequest, res: FastifyReply) => {
    const userId = (req as AuthenticatedRequest).userId;
    const result = await getFavoriteNamedResources<NamedResourceResponseByKind[TKind]>(
      kind,
      userId,
    );

    return res.code(200).send(result);
  };

export const getNamedResourceHandler =
  <TKind extends NamedResourceKind>(kind: TKind) =>
  async (req: FastifyRequest<{ Params: ParamsJustId }>, res: FastifyReply) => {
    const userId = (req as AuthenticatedRequest).userId;
    const result = await getNamedResource<NamedResourceResponseByKind[TKind]>(
      kind,
      req.params.id,
      userId,
    );

    return res.code(200).send(result);
  };

export const createNamedResourceHandler =
  <TKind extends NamedResourceKind>(kind: TKind) =>
  async (
    req: FastifyRequest<{ Body: NamedResourceBodyByKind[TKind] }>,
    res: FastifyReply,
  ) => {
    const userId = (req as AuthenticatedRequest).userId;
    const result = await createNamedResource(
      kind,
      userId,
      req.body as NamedResourceBodyByKind[TKind] & NameDTO,
    );

    return res.code(201).send(result);
  };

export const updateNamedResourceHandler =
  <TKind extends NamedResourceKind>(kind: TKind) =>
  async (
    req: FastifyRequest<{
      Params: ParamsJustId;
      Body: NamedResourceBodyByKind[TKind];
    }>,
    res: FastifyReply,
  ) => {
    const userId = (req as AuthenticatedRequest).userId;
    const result = await updateNamedResource(
      kind,
      req.params.id,
      userId,
      req.body as NamedResourceBodyByKind[TKind] & NameDTO,
    );

    return res.code(200).send(result);
  };

export const favoriteNamedResourceHandler =
  <TKind extends NamedResourceKind>(kind: TKind) =>
  async (req: FastifyRequest<{ Params: ParamsJustId }>, res: FastifyReply) => {
    const userId = (req as AuthenticatedRequest).userId;
    const result = await favoriteNamedResource<NamedResourceResponseByKind[TKind]>(
      kind,
      req.params.id,
      userId,
    );

    return res.code(200).send(result);
  };

export const unfavoriteNamedResourceHandler =
  <TKind extends NamedResourceKind>(kind: TKind) =>
  async (req: FastifyRequest<{ Params: ParamsJustId }>, res: FastifyReply) => {
    const userId = (req as AuthenticatedRequest).userId;
    const result = await unfavoriteNamedResource(kind, req.params.id, userId);

    return res.code(200).send(result);
  };

export const deleteNamedResourceHandler =
  <TKind extends NamedResourceKind>(kind: TKind) =>
  async (req: FastifyRequest<{ Params: ParamsJustId }>, res: FastifyReply) => {
    const userId = (req as AuthenticatedRequest).userId;
    const result = await deleteNamedResource(kind, req.params.id, userId);

    return res.code(200).send(result);
  };
