/**
 * First-time (or clean) local setup: .env, npm install, database sync, seed.
 * After this, run: npm run dev
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");
const envExamplePath = path.join(root, ".env.example");
const dbSyncScript = path.join(root, "scripts", "db-sync.mjs");

function run(command, options = {}) {
  execSync(command, { stdio: "inherit", cwd: root, env: process.env, ...options });
}

async function main() {
  console.info("\n[servetech-crm] Local setup\n");

  if (!existsSync(envPath)) {
    if (!existsSync(envExamplePath)) {
      console.error("Missing .env.example — cannot create .env");
      process.exit(1);
    }
    copyFileSync(envExamplePath, envPath);
    console.info("→ Created .env from .env.example (edit AUTH_SECRET before production).");
  } else {
    console.info("→ Using existing .env");
  }

  console.info("→ Installing npm dependencies…");
  run("npm install");

  console.info("→ Database sync (Docker + push + seed)…");
  run(`node "${dbSyncScript}"`);

  console.info("Setup complete. Start the app with:\n\n  npm run dev\n");
  console.info("Demo login: admin@servetech.global / Password123!\n");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
