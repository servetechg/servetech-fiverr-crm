# ServeTech Global — Fiverr CRM

Next.js CRM for Fiverr sales operations (leads, orders, upsells, follow-ups) with Admin / Salesperson RBAC.

## Quick start

**One command** (Docker Desktop must be running):

```bash
npm run setup
npm run dev
```

`setup` creates `.env` if missing, installs dependencies, starts MariaDB, applies the schema with **`prisma db push`** (no migration shadow DB), and seeds demo users.

**After pulling** changes that touch `prisma/schema.prisma`:

```bash
npm run db:sync
npm run dev
```

Manual steps (optional):

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:push
npm run db:seed
npm run dev
```

> **Why not `db:migrate`?** The default Docker MariaDB user cannot create Prisma’s shadow database. Use `db:sync` / `db:push` for local dev. See `prisma/migrations/README.md`.
>
> **Windows:** If `db:sync` fails with `EPERM` on Prisma, stop `npm run dev` and retry (the query engine file is locked while the app runs).

Open [http://localhost:3000](http://localhost:3000) and sign in with `admin@servetech.global` / `Password123!`.

MariaDB Adminer: [http://localhost:8080](http://localhost:8080) (server: `mariadb`, user: `servetech`, password: `servetech`).

## Docs

- `AGENTS.md` — commands and contributor checklist
- `docs/architecture.md` — layering and conventions
- `.cursor/rules/` — Cursor agent standards

## Implementation status

- **Phase 0–2 (done):** Tooling, Docker, Prisma schema, Auth.js, RBAC proxy, app shell, shared UI primitives.
- **Phase 3 (done):** Services, Fiverr Accounts, Sales Team — admin CRUD with Zod, services, Server Actions.
- **Phase 4 (done):** Leads — list filters, pagination, Quick Add, full add/edit, CSV import/export, RBAC scope, detail view, status-change activities.
- **Phase 5+:** Activities, Orders, Dashboard metrics (see remaining module placeholders).
