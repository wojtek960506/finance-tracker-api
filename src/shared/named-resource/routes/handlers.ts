import { FastifyReply, FastifyRequest } from 'fastify';

import { AccountDTO, AccountResponseDTO } from '@account/schema';
import { CategoryDTO, CategoryResponseDTO } from '@category/schema';
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
import { PaymentMethodDTO, PaymentMethodResponseDTO } from '@payment-method/schema';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

type NamedResourceBodyByKind = {
  account: AccountDTO;
  category: CategoryDTO;
  paymentMethod: PaymentMethodDTO;
};

type NamedResourceResponseByKind = {
  account: AccountResponseDTO;
  category: CategoryResponseDTO;
  paymentMethod: PaymentMethodResponseDTO;
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
