import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import redis from '../lib/redis';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AfricasTalking = require('africastalking');

const at = AfricasTalking({
  apiKey: process.env.AFRICAS_TALKING_API_KEY as string,
  username: process.env.AFRICAS_TALKING_USERNAME as string,
});

const sms = at.SMS;

export function generateTokens(user: { id: string; email: string; role: string }) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
}

export async function saveRefreshToken(
  userId: string,
  token: string,
  deviceId?: string
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: {
      token,
      user_id: userId,
      device_id: deviceId,
      expires_at: expiresAt,
    },
  });
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveOTP(phone: string, code: string): Promise<void> {
  await redis.set(`otp:${phone}`, code, { ex: 600 });
}

export async function getOTP(phone: string): Promise<string | null> {
  const value = await redis.get<string>(`otp:${phone}`);
  return value ?? null;
}

export async function deleteOTP(phone: string): Promise<void> {
  await redis.del(`otp:${phone}`);
}

export async function sendSMSOTP(phone: string, code: string): Promise<void> {
  await sms.send({
    to: [phone],
    message: `Your Ouvriers Ivoiriens code is: ${code}. Valid for 10 minutes.`,
  });
}
