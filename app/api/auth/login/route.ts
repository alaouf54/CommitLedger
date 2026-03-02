import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/auth';
import crypto from 'crypto';

function base64URLEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function sha256(buffer: string): Buffer {
  return crypto.createHash('sha256').update(buffer).digest();
}

export async function GET() {
  try {
    if (!process.env.GITHUB_CLIENT_ID) {
      return NextResponse.json({ error: 'GITHUB_CLIENT_ID is not configured' }, { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_BASE_URL is not configured' }, { status: 500 });
    }

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    const codeVerifier = base64URLEncode(crypto.randomBytes(32));
    const codeChallenge = base64URLEncode(sha256(codeVerifier));
    const state = base64URLEncode(crypto.randomBytes(16));

    session.codeVerifier = codeVerifier;
    session.oauthState = state;
    await session.save();

    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      scope: 'repo user:email',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
  } catch (err) {
    console.error('Login route error:', err);
    return NextResponse.json(
      { error: 'Login failed', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
