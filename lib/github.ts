import { Octokit } from '@octokit/rest';
import { Commit } from '@/types';

export async function fetchCommits(
  accessToken: string,
  owner: string,
  repo: string,
  author: string,
  since: string,
  until: string
): Promise<Commit[]> {
  const octokit = new Octokit({ auth: accessToken });

  const commits: Commit[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, headers } = await octokit.repos.listCommits({
      owner,
      repo,
      author,
      since,
      until,
      per_page: perPage,
      page,
    });

    commits.push(...(data as unknown as Commit[]));

    const remaining = parseInt(headers['x-ratelimit-remaining'] || '0');
    if (remaining < 10) {
      throw new Error('GitHub API rate limit approaching. Please try again later.');
    }

    if (data.length < perPage) break;
    page++;
  }

  // Fetch detailed stats for each commit (files changed, additions/deletions)
  const detailed = await Promise.all(
    commits.map(async (commit) => {
      try {
        const { data } = await octokit.repos.getCommit({
          owner,
          repo,
          ref: commit.sha,
        });
        return {
          ...commit,
          stats: data.stats as Commit['stats'],
          files: (data.files || []).map((f) => ({
            filename: f.filename!,
            status: f.status || 'modified',
            additions: f.additions || 0,
            deletions: f.deletions || 0,
            changes: f.changes || 0,
          })),
        };
      } catch {
        return commit;
      }
    })
  );

  return detailed;
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\?\#]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace('.git', '') };
}
