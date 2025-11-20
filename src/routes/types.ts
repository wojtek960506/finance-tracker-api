import { FastifyRequest } from "fastify";

export interface ParamsJustId {
  id: string;
}

export type AuthenticatedRequest = FastifyRequest & {
  userId: string
}