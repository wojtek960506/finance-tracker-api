import { FastifyRequest } from "fastify";

export interface ParamsJustId {
  id: string;
}

export interface DeleteManyReply {
  acknowledged: boolean;
  deletedCount: number;
}

export type AuthenticatedRequest = FastifyRequest & {
  userId: string
}

export type FilteredResponse<T> = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: T
}
