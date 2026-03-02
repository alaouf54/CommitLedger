'use client';

import { Commit, CommitGroup } from '@/types';
import { format, parseISO } from 'date-fns';
import styles from './CommitList.module.css';

interface CommitListProps {
  commits: Commit[];
  loading: boolean;
}

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

export default function CommitList({ commits, loading }: CommitListProps) {
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Fetching commits...</p>
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No commits found for the selected range.</p>
        <p>Try adjusting the date range or check the repository URL.</p>
      </div>
    );
  }

  const grouped = groupByDate(commits);

  return (
    <div className={styles.wrapper}>
      {Object.entries(grouped).map(([date, dayCommits]) => (
        <div key={date} className={styles.dayGroup}>
          <div className={styles.dateHeader}>
            <span className={styles.dateIcon}>📅</span>
            <span>{date}</span>
            <span className={styles.commitCount}>
              ({dayCommits.length} commit{dayCommits.length !== 1 ? 's' : ''})
            </span>
          </div>

          {dayCommits.map((commit) => {
            const firstLine = commit.commit.message.split('\n')[0];
            return (
              <div key={commit.sha} className={styles.commitCard}>
                <div className={styles.commitTop}>
                  <span className={styles.commitTime}>
                    {formatTime(commit.commit.author.date)}
                  </span>
                  <span className={styles.commitMessage}>
                    <a href={commit.html_url} target="_blank" rel="noopener noreferrer">
                      {firstLine}
                    </a>
                  </span>
                </div>
                <div className={styles.commitMeta}>
                  <span className={styles.statFiles}>
                    {commit.files?.length || 0} file{(commit.files?.length || 0) !== 1 ? 's' : ''}
                  </span>
                  <span className={styles.statAdd}>
                    +{commit.stats?.additions || 0}
                  </span>
                  <span className={styles.statDel}>
                    -{commit.stats?.deletions || 0}
                  </span>
                  <a
                    className={styles.linkGithub}
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on GitHub ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
