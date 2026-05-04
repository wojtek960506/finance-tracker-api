import { FastifyReply, FastifyRequest } from 'fastify';

import { ResendVerificationDTO } from '@auth/schema';
import { resendVerification } from '@auth/services';

export const resendVerificationHandler = async (
  req: FastifyRequest<{ Body: ResendVerificationDTO }>,
  res: FastifyReply,
) => {
  await resendVerification(req.body);
  return res.code(204).send();
};
