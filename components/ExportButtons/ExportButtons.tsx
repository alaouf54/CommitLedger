'use client';

import { Commit } from '@/types';
import { generateMarkdown } from '@/lib/exportMarkdown';
import { generatePDF } from '@/lib/exportPDF';
import styles from './ExportButtons.module.css';

interface ExportButtonsProps {
  commits: Commit[];
  repoUrl: string;
  author: string;
  since: string;
  until: string;
}

export default function ExportButtons({
  commits,
  repoUrl,
  author,
  since,
  until,
}: ExportButtonsProps) {
  const disabled = commits.length === 0;

  const handleMarkdown = () => {
    const md = generateMarkdown(commits, repoUrl, author, since, until);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-log-${repoUrl.replace('https://github.com/', '').replace(/\//g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePDF = () => {
    const doc = generatePDF(commits, repoUrl, author, since, until);
    doc.save(
      `work-log-${repoUrl.replace('https://github.com/', '').replace(/\//g, '-')}.pdf`
    );
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.btn} onClick={handleMarkdown} disabled={disabled}>
        <span className={styles.icon}>📄</span>
        Download Markdown
      </button>
      <button className={styles.btnPrimary} onClick={handlePDF} disabled={disabled}>
        <span className={styles.icon}>📑</span>
        Download PDF
      </button>
    </div>
  );
}
