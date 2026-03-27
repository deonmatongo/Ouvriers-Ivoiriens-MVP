import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import {
  generateTokens,
  saveRefreshToken,
  generateOTP,
  saveOTP,
  getOTP,
  deleteOTP,
  sendSMSOTP,
} from '../services/auth.service';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  role: z.enum(['client', 'artisan']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

const sendOTPSchema = z.object({
  phone: z.string(),
});

const verifyOTPSchema = z.object({
  phone: z.string(),
  code: z.string(),
});

export async function registerHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const result = registerSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ error: 'Validation error', details: result.error.flatten() });
  }

  const { name, email, phone, password, role } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return reply.status(409).send({ error: 'Email already registered' });
  }

  const password_hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, phone, password_hash, role },
  });

  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  await saveRefreshToken(user.id, refreshToken);

  return reply.status(201).send({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
}

export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const result = loginSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ error: 'Validation error', details: result.error.flatten() });
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  await saveRefreshToken(user.id, refreshToken);

  return reply.status(200).send({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
}

export async function refreshHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const result = refreshSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ error: 'Validation error', details: result.error.flatten() });
  }

  const { refreshToken } = result.data;

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expires_at < new Date()) {
    return reply.status(401).send({ error: 'Invalid or expired refresh token' });
  }

  let payload: { id: string; email: string; role: string };
  try {
    payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string; email: string; role: string };
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired refresh token' });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) {
    return reply.status(401).send({ error: 'User not found' });
  }

  const { accessToken } = generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return reply.status(200).send({ accessToken });
}

export async function sendOTPHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const result = sendOTPSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ error: 'Validation error', details: result.error.flatten() });
  }

  const { phone } = result.data;

  const user = await prisma.user.findFirst({ where: { phone } });
  if (!user) {
    return reply.status(404).send({ error: 'User not found' });
  }

  const code = generateOTP();
  await saveOTP(phone, code);
  await sendSMSOTP(phone, code);

  return reply.status(200).send({ message: 'OTP sent successfully' });
}

export async function verifyOTPHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const result = verifyOTPSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ error: 'Validation error', details: result.error.flatten() });
  }

  const { phone, code } = result.data;

  const stored = await getOTP(phone);
  if (!stored) {
    return reply.status(400).send({ error: 'Invalid or expired OTP' });
  }

  if (stored !== code) {
    return reply.status(400).send({ error: 'Invalid or expired OTP' });
  }

  await prisma.user.updateMany({ where: { phone }, data: { phone_verified: true } });
  await deleteOTP(phone);

  return reply.status(200).send({ message: 'Phone verified successfully' });
}
