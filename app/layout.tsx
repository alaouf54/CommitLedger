import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommitLedger — Turn GitHub commits into work logs",
  description:
    "Generate professional work logs from your GitHub commits. Perfect for internships, freelance reports, and portfolio reviews. Privacy-first, no data stored.",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
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
