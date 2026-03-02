import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/auth';
import { fetchCommits, parseRepoUrl } from '@/lib/github';

export async function GET(req: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const repoUrl = searchParams.get('repo');
  const since = searchParams.get('since');
  const until = searchParams.get('until');

  if (!repoUrl || !since || !until) {
    return NextResponse.json({ error: 'Missing required parameters: repo, since, until' }, { status: 400 });
  }

  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 });
  }

  try {
    const commits = await fetchCommits(
      session.accessToken,
      parsed.owner,
      parsed.repo,
      session.user!.login,
      since,
      until
    );

    return NextResponse.json({ commits });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch commits';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
