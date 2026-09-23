/**
 * Start Docker MariaDB (if needed), wait until it accepts connections,
 * apply schema from prisma/schema.prisma (db push), optionally seed.
 *
 * Use this after git pull when the schema changed — avoids `migrate dev`
 * shadow-database errors with the default Docker user.
 */
import { execSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const composeFile = path.join(root, "docker", "docker-compose.yml");

const skipSeed = process.argv.includes("--no-seed");
const skipUp = process.argv.includes("--no-up");

function run(command, options = {}) {
  execSync(command, { stdio: "inherit", cwd: root, env: process.env, ...options });
}

function waitForPort(host, port, maxAttempts = 45, delayMs = 2000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const tryOnce = () => {
      const socket = net.createConnection({ host, port }, () => {
        socket.end();
        resolve();
      });

      socket.setTimeout(3000);
      socket.on("timeout", () => {
        socket.destroy();
        scheduleRetry();
      });
      socket.on("error", () => {
        scheduleRetry();
      });
    };

    const scheduleRetry = () => {
      attempts += 1;
      if (attempts >= maxAttempts) {
        reject(
          new Error(
            `Database not reachable at ${host}:${port} after ${maxAttempts} tries. ` +
              "Is Docker running? Try: npm run db:up",
          ),
        );
        return;
      }
      setTimeout(tryOnce, delayMs);
    };

    tryOnce();
  });
}

async function main() {
  console.info("\n[servetech-crm] Syncing database (schema push + seed)…\n");

  if (!skipUp) {
    console.info("→ Starting MariaDB (docker compose)…");
    run(`docker compose -f "${composeFile}" up -d`);
  }

  console.info("→ Waiting for MariaDB on localhost:3306…");
  await waitForPort("127.0.0.1", 3306);

  console.info("→ Applying schema (prisma db push)…");
  run("npx prisma db push --accept-data-loss");

  if (!skipSeed) {
    console.info("→ Seeding demo data…");
    run("npx prisma db seed");
  }

  console.info("\n[servetech-crm] Database is ready.\n");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
