# Migrations

Local Docker MariaDB user `servetech` cannot create Prisma shadow databases by default.

**Options:**

1. **Dev sync:** `npm run db:push` (used for initial setup)
2. **Migrations:** temporarily set `DATABASE_URL` to root, or grant `CREATE` on `*.*` to `servetech`
3. **CI:** use `db push` or a dedicated migration user with shadow DB privileges

After granting privileges: `npm run db:migrate`
