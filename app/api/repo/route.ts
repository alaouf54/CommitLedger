import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/auth';
import { Octokit } from '@octokit/rest';
import { parseRepoUrl } from '@/lib/github';

export async function GET(req: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const repoUrl = searchParams.get('repo');

  if (!repoUrl) {
    return NextResponse.json({ error: 'Missing repo parameter' }, { status: 400 });
  }

  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 });
  }

  try {
    const octokit = new Octokit({ auth: session.accessToken });
    const { data } = await octokit.repos.get({
      owner: parsed.owner,
      repo: parsed.repo,
    });

    return NextResponse.json({
      name: data.full_name,
      description: data.description,
      private: data.private,
      default_branch: data.default_branch,
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return NextResponse.json({ error: 'Repository not found or no access' }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : 'Failed to validate repository';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
