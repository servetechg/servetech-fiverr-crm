# Migrations

Local Docker MariaDB user `servetech` cannot create Prisma shadow databases by default.

**Recommended (team / fresh clone):**

```bash
npm run setup      # first time
npm run db:sync    # after git pull when schema changed
```

Both use **`prisma db push`** and wait for Docker MariaDB — no shadow database required.

**Options:**

1. **Dev sync:** `npm run db:sync` or `npm run db:push`
2. **Migrations:** temporarily set `DATABASE_URL` to root, or grant `CREATE` on `*.*` to `servetech`
3. **CI:** use `db push` or a dedicated migration user with shadow DB privileges

After granting privileges: `npm run db:migrate`
