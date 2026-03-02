'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RepoInput from '@/components/RepoInput/RepoInput';
import styles from './page.module.css';

interface User {
  login: string;
  avatar_url: string;
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const error = searchParams.get('error');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = useCallback(() => {
    window.location.href = '/api/auth/login';
  }, []);

  const handleRepoValidated = useCallback(
    (repoUrl: string) => {
      router.push(`/generate?repo=${encodeURIComponent(repoUrl)}`);
    },
    [router]
  );

  return (
    <div className={styles.container}>
      {!loading && user && (
        <div className={styles.userBar}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.avatar}
            src={user.avatar_url}
            alt={user.login}
            width={24}
            height={24}
          />
          <span>{user.login}</span>
          <a href="/api/auth/logout" className={styles.logoutBtn}>
            Sign out
          </a>
        </div>
      )}

      <div className={styles.hero}>
        <div className={styles.logo}>🗂️</div>
        <h1 className={styles.title}>CommitLedger</h1>
        <p className={styles.subtitle}>
          Turn your GitHub commits into a professional work log. 
          Perfect for internships, freelance reports, and portfolio reviews.
        </p>
      </div>

      {error && (
        <p className={styles.error}>
          Authentication failed. Please try again.
        </p>
      )}

      <div className={styles.form}>
        <RepoInput
          onRepoValidated={handleRepoValidated}
          isAuthenticated={!!user}
          onLogin={handleLogin}
        />

        <button
          className={styles.generateBtn}
          onClick={() => {
            if (!user) {
              handleLogin();
            }
          }}
          disabled={loading}
        >
          {user ? 'Generate Log →' : 'Connect GitHub to Start'}
        </button>
      </div>

      <div className={styles.features}>
        <span className={styles.feature}>
          <span className={styles.featureCheck}>✓</span>Works with private repos
        </span>
        <span className={styles.feature}>
          <span className={styles.featureCheck}>✓</span>No data stored — privacy-first
        </span>
        <span className={styles.feature}>
          <span className={styles.featureCheck}>✓</span>Export to Markdown or PDF
        </span>
      </div>

      <footer className={styles.footer}>
        <p>
          Open source on{' '}
          <a
            href="https://github.com/flodlol/commitledger"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          {' · '}
          No data stored. No tracking.
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
