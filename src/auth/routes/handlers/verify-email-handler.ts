import { FastifyReply, FastifyRequest } from 'fastify';

import { VerifyEmailDTO } from '@auth/schema';
import { verifyEmail } from '@auth/services';

export const verifyEmailHandler = async (
  req: FastifyRequest<{ Body: VerifyEmailDTO }>,
  res: FastifyReply,
) => {
  await verifyEmail(req.body);
  return res.code(204).send();
};
