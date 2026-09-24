import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PrismaClient } from "@prisma/client";

function prismaSchemaCacheKey(): string {
  try {
    const schemaPath = join(process.cwd(), "prisma", "schema.prisma");
    const schema = readFileSync(schemaPath, "utf8");
    return createHash("sha256").update(schema).digest("hex").slice(0, 16);
  } catch {
    return "default";
  }
}

type PrismaGlobal = typeof globalThis & {
  __prismaClients?: Record<string, PrismaClient>;
};

const globalForPrisma = globalThis as PrismaGlobal;
const cacheKey = prismaSchemaCacheKey();

if (!globalForPrisma.__prismaClients) {
  globalForPrisma.__prismaClients = {};
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.__prismaClients[cacheKey] ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prismaClients[cacheKey] = prisma;
}
