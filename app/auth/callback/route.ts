import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/auth';
import { Octokit } from '@octokit/rest';

export async function GET(req: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Validate state
  if (!code || !state || state !== session.oauthState) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=invalid_state`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        code_verifier: session.codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/?error=${tokenData.error}`
      );
    }

    // Fetch user info
    const octokit = new Octokit({ auth: tokenData.access_token });
    const { data: user } = await octokit.users.getAuthenticated();

    // Store in session
    session.accessToken = tokenData.access_token;
    session.user = {
      login: user.login,
      avatar_url: user.avatar_url,
    };
    delete session.codeVerifier;
    delete session.oauthState;
    await session.save();

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/generate`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=auth_failed`);
  }
}
