import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const decoded = await request.jwtVerify<{
      id: string;
      email: string;
      role: string;
    }>();
    request.user = decoded;
  } catch {
    reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' });
  }
}
