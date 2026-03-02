<div align="center">
  <h1>🗂️ CommitLedger</h1>
  <p><strong>Turn your GitHub commits into a professional work log</strong></p>
  <p>Perfect for internships, freelance reports, and portfolio reviews</p>

  <!-- <img src="demo.gif" alt="Demo" width="600"/> -->

  <p>
    <a href="https://commitledger.netlify.app">Try it now →</a>
  </p>
</div>

---

## Why CommitLedger?

You've been coding for weeks. Your commits tell the story. But when your manager asks "What did you work on?" or a client wants a progress report, you're stuck:

- ❌ Scrolling through `git log` (ugly, technical)
- ❌ Manually copy-pasting commits into Google Docs
- ❌ Hoping your PR descriptions are detailed enough

**CommitLedger fixes this in 30 seconds:**

1. Paste your repo URL
2. Pick a date range
3. Export a polished work log (Markdown or PDF)

---

## Features

- ✅ **Private repos supported** — secure GitHub OAuth
- ✅ **No data stored** — 100% privacy-first, zero database
- ✅ **Beautiful exports** — professional Markdown & PDF
- ✅ **Lightning fast** — no signup, no config, just paste & go

---

## Tech Stack

- **Next.js 14+** (App Router, React Server Components)
- **TypeScript** (strict mode)
- **CSS Modules** (no Tailwind)
- **iron-session** (encrypted cookie sessions)
- **Octokit** (GitHub REST API)
- **jsPDF** (PDF generation)

---

## Getting Started

### Prerequisites

- Node.js 18+
- A GitHub OAuth App ([create one here](https://github.com/settings/applications/new))

### Setup

```bash
# Clone the repo
git clone https://github.com/flodlol/commitledger.git
cd commitledger

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your GitHub OAuth credentials and session secret
# See .env.example for instructions

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start generating work logs.

### GitHub OAuth App Setup

1. Go to [github.com/settings/applications/new](https://github.com/settings/applications/new)
2. **Application name:** CommitLedger (or anything)
3. **Homepage URL:** `http://localhost:3000`
4. **Authorization callback URL:** `http://localhost:3000/auth/callback`
5. Click "Register application"
6. Copy the **Client ID** and generate a **Client Secret**
7. Add both to your `.env.local`

---

## Who is this for?

- **Interns** documenting weekly contributions
- **Freelancers** generating client progress reports
- **Open-source maintainers** summarizing work for sponsors
- **Job seekers** creating portfolio activity logs

---

## Privacy & Security

- **No database** — your commit data is never stored
- **No tracking** — we don't log repos or export contents
- **Secure OAuth** — tokens stored in encrypted httpOnly cookies, never in localStorage
- **PKCE flow** — prevents authorization code interception
- **Open source** — audit the code yourself

---

## Export Examples

<details>
<summary>Markdown Output</summary>

```markdown
# Work Log: facebook/react
**Author:** gaearon
**Period:** Jan 1 – Jan 31, 2024
**Total Commits:** 47

## January 1, 2024

### [Add React.use() for suspense data fetching](https://github.com/...)
**Time:** 10:23 AM
**Files changed:** 5 (+124 -32)

**Modified files:**
- `packages/react/src/ReactHooks.js`
- `packages/react-reconciler/src/ReactFiberHooks.js`

---

## Summary
- Total commits: 47
- Files changed: 142
- Lines added: 3,421
- Lines deleted: 1,203
```

</details>

<details>
<summary>PDF Output</summary>

Professional PDF with:
- Navy headings, gray body text
- Date-grouped commits with timestamps
- File change statistics
- Page numbers and generation date

</details>

---

## Roadmap

- [x] MVP: Single repo, Markdown/PDF export
- [ ] Multi-repo support
- [ ] Custom export templates
- [ ] CLI tool
- [ ] Browser extension

---

## Contributing

Contributions are welcome and appreciated! Whether it's fixing a typo, improving the UI, adding a feature, or just reporting a bug. All help is valued.

### Ways to contribute

- **Bug reports** — Found something broken? Open an issue
- **Feature requests** — Have an idea? Let's hear it
- **Pull requests** — Code contributions are always welcome
- **Documentation** — Help make the README or comments clearer
- **Design feedback** — Suggestions for better UX are great too

### To submit a PR

1. Fork the repo
2. Create a branch (`git checkout -b my-feature`)
3. Make your changes
4. Run `npm run lint` to check for issues
5. Commit and push
6. Open a pull request

No contribution is too small. Even fixing a single typo helps.

---

## License

MIT — do whatever you want with it.

---

<div align="center">
  If you find this useful, a star on GitHub would be nice. ⭐ <br/>
  Thanks for checking it out! ❤️
  <br/>
  <a href="https://github.com/sponsors/flodlol">Sponsor this project</a>
</div>
