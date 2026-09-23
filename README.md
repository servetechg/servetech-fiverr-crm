# ServeTech Global — Fiverr CRM

Next.js CRM for Fiverr sales operations (leads, orders, upsells, follow-ups) with Admin / Salesperson RBAC.

## Quick start

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with `admin@servetech.global` / `Password123!`.

MariaDB Adminer: [http://localhost:8080](http://localhost:8080) (server: `mariadb`, user: `servetech`, password: `servetech`).

## Docs

- `AGENTS.md` — commands and contributor checklist
- `docs/architecture.md` — layering and conventions
- `.cursor/rules/` — Cursor agent standards

## Implementation status

- **Phase 0–2 (done):** Tooling, Docker, Prisma schema, Auth.js, RBAC middleware, app shell, shared UI primitives.
- **Phase 3 (done):** Services, Fiverr Accounts, Sales Team — admin CRUD with Zod, services, Server Actions.
- **Phase 4 (done):** Leads — list filters, pagination, Quick Add, full add/edit, CSV import/export, RBAC scope, detail view, status-change activities.
- **Phase 5+:** Activities, Orders, Dashboard metrics (see remaining module placeholders).
