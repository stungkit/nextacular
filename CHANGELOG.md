# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `docker-compose.yml` with Postgres 16, [Mailpit](https://mailpit.axllent.org/) (for capturing magic-link emails locally), and Adminer.
- New npm scripts: `db:up`, `db:down`, `db:reset`, `db:logs`, `db:studio`, `seed`. Local dev now boots with `npm install && npm run db:up && npx prisma migrate deploy && npm run seed && npm run dev`.
- Seed script (`prisma/seed.ts`, replacing `prisma/seed.js`) creates a demo workspace with an admin owner and two teammate users (one accepted, one pending invitation) so the dashboard is non-empty on first run.
- `docs/ENV.md` — full reference for every environment variable: required vs. optional, where to get each value, examples for hosted Postgres and Stripe webhooks.
- Rewritten `.env.sample` with defaults that match `docker-compose.yml` and inline guidance grouped by feature area.
- `tsx` devDependency so Prisma can run TypeScript seed and script files directly.

### Changed

- TypeScript-first codebase: `src/`, `prisma/services/`, `src/lib/`, the API routes, components, layouts, pages, and middleware are all `.ts` / `.tsx`. `strict: true` + `noUncheckedIndexedAccess: true`. CI now runs `tsc --noEmit` on every PR.
- Tooling foundation: Node 22 pinned via `.nvmrc` and `engines`, Prettier + EditorConfig, tightened ESLint (`no-console` as warn, `prefer-const`, `eqeqeq`, `no-var`), GitHub Actions CI (lint + format + typecheck + build with a Postgres service container), CodeQL workflow on a weekly schedule, `SECURITY.md`, PR template.
- `CONTRIBUTING.md` rewritten with the docker-compose workflow and a scripts reference table.

## [1.4.2] - 2026-05-30

### Security

- **Authorization bypass on team member management.** `PUT /api/workspace/team/role` and `DELETE /api/workspace/team/member` previously only verified the request was authenticated and accepted any `memberId` from the request body. Any logged-in user could change the role of, or remove, any member of any workspace. Both routes now verify the requesting user is an owner of the workspace that the target member belongs to.
- **Missing `await` in `team/role.js` caused every role toggle to silently force the target member to `MEMBER`.** Combined with the authorization bypass above, this allowed any logged-in user to demote any workspace owner. Fixed.
- **Workspace membership and domain listing endpoints leaked data across tenants.** `GET /api/workspace/[workspaceSlug]/members` and `GET /api/workspace/[workspaceSlug]/domains` previously only checked authentication. Any logged-in user could enumerate members or domains of any workspace by guessing the slug. Both endpoints now require the requesting user to be a member of that workspace.
- **Custom domain mutations no longer accept calls from non-owners.** `POST`, `PUT`, and `DELETE` on `/api/workspace/[workspaceSlug]/domain` now require workspace ownership. Previously these would issue Vercel API calls on behalf of any authenticated user with knowledge of a workspace slug.

### Added

- `src/lib/server/authorization.js` — `requireWorkspaceOwner`, `requireWorkspaceMember`, and `requireMemberInOwnedWorkspace` helpers. Use these at the top of any new API route that touches workspace-scoped data.
- `CHANGELOG.md` (this file).

### Removed

- `yarn.lock`. The project now uses npm as the single source of truth for dependencies.
- Empty `src/app_old/` directory left over from a prior App Router migration attempt.
