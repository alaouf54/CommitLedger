import { Commit, CommitGroup } from '@/types';
import { format, parseISO } from 'date-fns';

function groupByDate(commits: Commit[]): CommitGroup {
  const groups: CommitGroup = {};
  for (const commit of commits) {
    const date = format(parseISO(commit.commit.author.date), 'MMMM d, yyyy');
    if (!groups[date]) groups[date] = [];
    groups[date].push(commit);
  }
  return groups;
}

function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'h:mm a');
}

function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function generateMarkdown(
  commits: Commit[],
  repoUrl: string,
  author: string,
  since: string,
  until: string
): string {
  const repoName = repoUrl.replace('https://github.com/', '').replace(/\/$/, '');

  let md = `# Work Log: ${repoName}\n`;
  md += `**Author:** ${author}  \n`;
  md += `**Period:** ${formatDate(since)} – ${formatDate(until)}  \n`;
  md += `**Total Commits:** ${commits.length}\n\n---\n\n`;

  const grouped = groupByDate(commits);

  for (const [date, dayCommits] of Object.entries(grouped)) {
    md += `## ${date}\n\n`;

    for (const commit of dayCommits) {
      const firstLine = commit.commit.message.split('\n')[0];
      md += `### [${firstLine}](${commit.html_url})\n`;
      md += `**Time:** ${formatTime(commit.commit.author.date)}  \n`;
      md += `**Files changed:** ${commit.files?.length || 0}`;

      const stats = commit.stats;
      if (stats) {
        md += ` (+${stats.additions} -${stats.deletions})`;
      }
      md += `\n\n`;

      if (commit.files && commit.files.length > 0) {
        md += `**Modified files:**\n`;
        commit.files.slice(0, 10).forEach((f) => {
          md += `- \`${f.filename}\`\n`;
        });
        if (commit.files.length > 10) {
          md += `- _(and ${commit.files.length - 10} more)_\n`;
        }
        md += `\n`;
      }

      md += `---\n\n`;
    }
  }

  // Summary
  const totalFiles = new Set(commits.flatMap((c) => c.files?.map((f) => f.filename) || [])).size;
  const totalAdditions = commits.reduce((sum, c) => sum + (c.stats?.additions || 0), 0);
  const totalDeletions = commits.reduce((sum, c) => sum + (c.stats?.deletions || 0), 0);

  md += `## Summary\n\n`;
  md += `- **Total commits:** ${commits.length}\n`;
  md += `- **Files changed:** ${totalFiles}\n`;
  md += `- **Lines added:** ${totalAdditions.toLocaleString()}\n`;
  md += `- **Lines deleted:** ${totalDeletions.toLocaleString()}\n`;

  return md;
}
