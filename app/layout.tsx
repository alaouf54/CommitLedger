import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommitLedger — Turn GitHub commits into work logs",
  description:
    "Generate professional work logs from your GitHub commits. Perfect for internships, freelance reports, and portfolio reviews. Privacy-first, no data stored.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
