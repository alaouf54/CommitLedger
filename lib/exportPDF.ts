import { Commit, CommitGroup } from '@/types';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';

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

export function generatePDF(
  commits: Commit[],
  repoUrl: string,
  author: string,
  since: string,
  until: string
): jsPDF {
  const doc = new jsPDF();
  const repoName = repoUrl.replace('https://github.com/', '').replace(/\/$/, '');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // --- Title Page Header ---
  doc.setFontSize(24);
  doc.setTextColor(26, 54, 93);
  doc.text('Work Log', margin, 30);

  doc.setFontSize(16);
  doc.setTextColor(26, 54, 93);
  doc.text(repoName, margin, 42);

  doc.setFontSize(11);
  doc.setTextColor(74, 85, 104);
  doc.text(`Author: ${author}`, margin, 54);
  doc.text(`Period: ${formatDate(since)} – ${formatDate(until)}`, margin, 62);
  doc.text(`Total Commits: ${commits.length}`, margin, 70);
  doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy')}`, margin, 78);

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, 84, pageWidth - margin, 84);

  let yPos = 96;

  const grouped = groupByDate(commits);

  for (const [date, dayCommits] of Object.entries(grouped)) {
    // Check if we need a new page for the date header
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    // Date header
    doc.setFontSize(14);
    doc.setTextColor(26, 54, 93);
    doc.text(date, margin, yPos);

    // Date underline
    doc.setDrawColor(26, 54, 93);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos + 2, margin + doc.getTextWidth(date), yPos + 2);
    yPos += 12;

    for (const commit of dayCommits) {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      // Time
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(formatTime(commit.commit.author.date), margin, yPos);
      yPos += 5;

      // Commit message (first line only)
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      const firstLine = commit.commit.message.split('\n')[0];
      const lines = doc.splitTextToSize(firstLine, contentWidth);
      doc.text(lines, margin, yPos);
      yPos += lines.length * 5 + 2;

      // Stats
      doc.setFontSize(9);
      const filesText = `${commit.files?.length || 0} files  •  `;
      doc.setTextColor(100, 100, 100);
      doc.text(filesText, margin, yPos);
      let xPos = margin + doc.getTextWidth(filesText);

      const additionsText = `+${commit.stats?.additions || 0}`;
      doc.setTextColor(34, 139, 34);
      doc.text(additionsText, xPos, yPos);
      xPos += doc.getTextWidth(additionsText + '  ');

      const deletionsText = `-${commit.stats?.deletions || 0}`;
      doc.setTextColor(220, 38, 38);
      doc.text(deletionsText, xPos, yPos);
      yPos += 5;

      // File list (up to 5 files)
      if (commit.files && commit.files.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);
        const filesToShow = commit.files.slice(0, 5);
        for (const f of filesToShow) {
          if (yPos > 275) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`  ${f.filename}`, margin, yPos);
          yPos += 4;
        }
        if (commit.files.length > 5) {
          doc.text(`  ... and ${commit.files.length - 5} more`, margin, yPos);
          yPos += 4;
        }
      }

      yPos += 6;
    }

    yPos += 4;
  }

  // --- Summary ---
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFontSize(14);
  doc.setTextColor(26, 54, 93);
  doc.text('Summary', margin, yPos);
  yPos += 10;

  const totalFiles = new Set(commits.flatMap((c) => c.files?.map((f) => f.filename) || [])).size;
  const totalAdditions = commits.reduce((sum, c) => sum + (c.stats?.additions || 0), 0);
  const totalDeletions = commits.reduce((sum, c) => sum + (c.stats?.deletions || 0), 0);

  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text(`Total commits: ${commits.length}`, margin, yPos);
  yPos += 7;
  doc.text(`Files changed: ${totalFiles}`, margin, yPos);
  yPos += 7;
  doc.text(`Lines added: ${totalAdditions.toLocaleString()}`, margin, yPos);
  yPos += 7;
  doc.text(`Lines deleted: ${totalDeletions.toLocaleString()}`, margin, yPos);

  // --- Page numbers ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}  •  Generated by CommitLedger`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
}
