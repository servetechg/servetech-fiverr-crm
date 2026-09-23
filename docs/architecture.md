# ServeTech CRM Architecture

## Layers

1. **`src/app`** — Routes, layouts, thin pages. No direct Prisma calls in pages when a service exists.
2. **`src/app/actions`** — Server Actions: Zod parse → `lib/services` → `revalidatePath`.
3. **`lib/services`** — Business rules, RBAC enforcement, transactions.
4. **`lib/queries`** — Read-only aggregates (dashboard, reports).
5. **`lib/validations`** — Zod schemas; infer input types with `z.infer`.
6. **`types/`** — View models and shared result types only (avoid duplicating Zod shapes).

## Auth & RBAC

- JWT sessions via Auth.js (`src/auth.ts`).
- `middleware.ts` guards routes; admin-only paths in `lib/auth/rbac.ts`.
- Salesperson data scope: filter by `salesperson_id` / assigned lead chain in services.

## Database

- MariaDB via Docker (`docker/docker-compose.yml`).
- Prisma schema: `prisma/schema.prisma`.
- Seed: `npm run db:seed`.
