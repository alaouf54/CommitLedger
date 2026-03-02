'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DateRangePicker from '@/components/DateRangePicker/DateRangePicker';
import CommitList from '@/components/CommitList/CommitList';
import ExportButtons from '@/components/ExportButtons/ExportButtons';
import { Commit } from '@/types';
import styles from './page.module.css';

interface User {
  login: string;
  avatar_url: string;
}

function GenerateContent() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get('repo') || '';

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [since, setSince] = useState('');
  const [until, setUntil] = useState('');

  const repoName = repoUrl.replace('https://github.com/', '').replace(/\/$/, '');
  const initialFetchDone = useRef(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const handleRangeChange = useCallback((s: string, u: string) => {
    setSince(s);
    setUntil(u);
  }, []);

  const handleFetch = useCallback(async () => {
    if (!repoUrl) {
      setError('No repository selected. Please go back and enter a repository URL.');
      return;
    }
    if (!since || !until) {
      setError('Please select a date range.');
      return;
    }

    setError('');
    setLoading(true);
    setCommits([]);

    try {
      const params = new URLSearchParams({
        repo: repoUrl,
        since,
        until,
      });

      const res = await fetch(`/api/commits?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch commits');
        return;
      }

      setCommits(data.commits);
    } catch {
      setError('An error occurred while fetching commits. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [repoUrl, since, until]);

  // Auto-fetch commits when all params are ready on initial load
  useEffect(() => {
    if (!initialFetchDone.current && repoUrl && since && until && !authLoading && user) {
      initialFetchDone.current = true;
      handleFetch();
    }
  }, [repoUrl, since, until, authLoading, user, handleFetch]);

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.authPrompt}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.authPrompt}>
          <p>You need to sign in with GitHub to generate work logs.</p>
          <button
            className={styles.authBtn}
            onClick={() => (window.location.href = '/api/auth/login')}
          >
            Connect GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <a href="/" className={styles.backLink}>
            ← Back
          </a>
          <span className={styles.repoName}>{repoName || 'No repo selected'}</span>
        </div>
        <div className={styles.headerRight}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.avatar}
            src={user.avatar_url}
            alt={user.login}
            width={24}
            height={24}
          />
          <span>{user.login}</span>
          <a href="/api/auth/logout" className={styles.logoutLink}>
            Sign out
          </a>
        </div>
      </div>

      <div className={styles.controls}>
        <DateRangePicker onRangeChange={handleRangeChange} />
        <button
          className={styles.fetchBtn}
          onClick={handleFetch}
          disabled={loading || !repoUrl || !since || !until}
        >
          {loading ? 'Fetching...' : 'Fetch Commits'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.results}>
        <CommitList commits={commits} loading={loading} />

        {commits.length > 0 && (
          <div className={styles.exportBar}>
            <span className={styles.commitSummary}>
              {commits.length} commit{commits.length !== 1 ? 's' : ''} found
            </span>
            <ExportButtons
              commits={commits}
              repoUrl={repoUrl}
              author={user.login}
              since={since}
              until={until}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense>
      <GenerateContent />
    </Suspense>
  );
}
