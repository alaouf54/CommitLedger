'use client';

import { useState, useCallback } from 'react';
import styles from './RepoInput.module.css';

interface RepoInfo {
  name: string;
  description: string | null;
  private: boolean;
  default_branch: string;
}

interface RepoInputProps {
  onRepoValidated: (repoUrl: string, repoInfo: RepoInfo) => void;
  isAuthenticated: boolean;
  onLogin: () => void;
}

export default function RepoInput({ onRepoValidated, isAuthenticated, onLogin }: RepoInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);

  const validateUrl = (value: string): boolean => {
    return /^https?:\/\/github\.com\/[^\/]+\/[^\/\?\#]+/.test(value);
  };

  const handleSubmit = useCallback(async () => {
    setError('');

    if (!url.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid GitHub URL (e.g., https://github.com/owner/repo)');
      return;
    }

    if (!isAuthenticated) {
      onLogin();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/repo?repo=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to access repository');
        return;
      }

      setRepoInfo(data);
      onRepoValidated(url, data);
    } catch {
      setError('Failed to validate repository. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [url, isAuthenticated, onLogin, onRepoValidated]);

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="repo-url">Repository URL</label>
      <div className={styles.inputGroup}>
        <input
          id="repo-url"
          className={`${styles.input} ${error ? styles.invalid : ''}`}
          type="url"
          placeholder="https://github.com/owner/repo"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError('');
            setRepoInfo(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {repoInfo && (
        <div className={styles.repoInfo}>
          <span>{repoInfo.name}</span>
          <span className={repoInfo.private ? styles.badgePrivate : styles.badgePublic}>
            {repoInfo.private ? 'Private' : 'Public'}
          </span>
        </div>
      )}
    </div>
  );
}
