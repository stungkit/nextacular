# Contributing to Nextacular

Thanks for your interest in improving Nextacular. This guide explains how to set up the project locally, the standards we expect for code changes, and how to submit a pull request.

## Code of Conduct

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). For security-related reports, please follow our [Security Policy](SECURITY.md) instead of opening a public issue.

## Prerequisites

- **Node.js 22** (Active LTS). The version is pinned in `.nvmrc`; if you use `nvm`, run `nvm use` from the repo root.
- **npm** (bundled with Node). We do not commit a `yarn.lock` or `pnpm-lock.yaml`.
- **PostgreSQL 14+** running locally, or a hosted database (Supabase, Neon, Railway, etc.).

## Local setup

```bash
# 1. Fork and clone
git clone https://github.com/<your-handle>/nextacular.git
cd nextacular

# 2. Use the pinned Node version
nvm use   # or: fnm use

# 3. Install dependencies (this also runs `prisma generate`)
npm install

# 4. Copy the env template and fill in the required values
cp .env.sample .env

# 5. Apply database migrations
npx prisma migrate deploy

# 6. (Optional) Seed sample data
npx prisma db seed

# 7. Start the dev server
npm run dev
```

The app will be available at <http://localhost:3000>.

### Required environment variables

At minimum you need:

- `DATABASE_URL` — Postgres connection string
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `APP_URL` — usually `http://localhost:3000`
- `EMAIL_FROM`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_SERVICE` — required for magic-link auth. For local development you can point this at an SMTP test inbox (Mailtrap, MailHog, etc.).

See `.env.sample` for the full list and where to source each value.

## Scripts

| Command                | Purpose                              |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the dev server with hot reload |
| `npm run build`        | Production build                     |
| `npm run start`        | Run the production build             |
| `npm run lint`         | Run ESLint                           |
| `npm run format`       | Run Prettier on the codebase         |
| `npm run format:check` | Verify formatting without writing    |

## Project conventions

- All workspace-scoped API routes must verify authorization with `requireWorkspaceOwner` or `requireWorkspaceMember` from `src/lib/server/authorization.js` before mutating or reading workspace data. Session presence alone is **not** sufficient.
- Error responses use the shape `{ errors: { error: { msg: '...' } } }` for compatibility with the existing client-side toast handling.
- Server-only code lives under `src/lib/server/`. Anything imported from there must never end up in a client bundle.
- Prisma services live under `prisma/services/` and are the single layer that talks to the database.

## Submitting a pull request

1. Create a branch from `main`. Use a short, descriptive name (`fix/team-role-bypass`, `feat/sso-google`, `chore/upgrade-prisma`).
2. Make focused changes. One concern per PR is much easier to review than a sprawling change.
3. Run `npm run lint`, `npm run format:check`, and `npm run build` locally.
4. Update `CHANGELOG.md` for user-facing changes.
5. Open a PR against `main` and fill out the template. CI will run lint and build automatically.
6. For security fixes, **do not open a public PR first** — coordinate via the process in [SECURITY.md](SECURITY.md).

## Reporting bugs

Open a GitHub issue with:

- A short summary
- Steps to reproduce
- What you expected vs. what happened
- Your environment (Node version, OS, browser if relevant)
- Logs or screenshots if useful

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
