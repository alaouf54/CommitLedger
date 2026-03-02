export interface CommitFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
}

export interface CommitStats {
  additions: number;
  deletions: number;
  total: number;
}

export interface Commit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  stats?: CommitStats;
  files?: CommitFile[];
}

export interface SessionData {
  accessToken?: string;
  codeVerifier?: string;
  oauthState?: string;
  user?: {
    login: string;
    avatar_url: string;
  };
}

export interface CommitGroup {
  [date: string]: Commit[];
}
