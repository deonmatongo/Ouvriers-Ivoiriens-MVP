import { FastifyInstance } from 'fastify';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  sendOTPHandler,
  verifyOTPHandler,
} from '../controllers/auth.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  const authRateLimit = {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
  };

  fastify.post('/register', authRateLimit, registerHandler);
  fastify.post('/login', authRateLimit, loginHandler);
  fastify.post('/refresh', authRateLimit, refreshHandler);
  fastify.post('/send-otp', authRateLimit, sendOTPHandler);
  fastify.post('/verify-otp', authRateLimit, verifyOTPHandler);
}
