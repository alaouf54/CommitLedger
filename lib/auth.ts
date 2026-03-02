import { SessionOptions } from 'iron-session';
import { SessionData } from '@/types';
import crypto from 'crypto';

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '⚠️  SESSION_SECRET is not set. Generating a random secret. ' +
      'Sessions will NOT persist across deployments or cold starts. ' +
      'Set SESSION_SECRET in your environment variables for stable sessions.'
    );
  }

  return crypto.randomBytes(32).toString('hex');
}

export const sessionOptions: SessionOptions = {
  password: getSessionSecret(),
  cookieName: 'commitledger_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export type { SessionData };
