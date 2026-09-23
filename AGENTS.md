<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ServeTech Global — Fiverr CRM

Internal CRM for Fiverr sales: leads → orders → upsells, with RBAC (Admin / Salesperson).

## Commands

| Command | Purpose |
|---------|---------|
| `npm run setup` | First-time local setup (.env, install, DB, seed) |
| `npm run db:sync` | After pull: Docker up, `db push`, seed |
| `npm run db:up` | Start MariaDB + Adminer (http://localhost:8080) |
| `npm run db:push` | Apply schema from `schema.prisma` (local dev) |
| `npm run db:migrate` | Optional; needs shadow DB privileges (see `prisma/migrations/README.md`) |
| `npm run db:seed` | Seed admin + sample data |
| `npm run dev` | Next.js dev server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Production build |

Copy `.env.example` → `.env` before first run (or run `npm run setup`).

Do not use deprecated APIs — see `.cursor/rules/no-deprecated-apis.mdc` and ESLint `@typescript-eslint/no-deprecated`.

## Demo login (after seed)

- **Admin:** `admin@servetech.global` / `Password123!`
- **Sales:** `sales@servetech.global` / `Password123!`

## Adding a new entity (checklist)

1. Prisma model + migration
2. `lib/validations/{entity}/`
3. `lib/services/{entity}/`
4. `app/actions/{entity}.ts`
5. `types/{entity}/` for view types if needed
6. Module page under `app/(dashboard)/`

See `docs/architecture.md` and `.cursor/rules/`.
