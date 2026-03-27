import { FastifyRequest, FastifyReply } from 'fastify';

export function authorize(roles: string | string[]) {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user || !allowed.includes(request.user.role)) {
      reply.status(403).send({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
  };
}
