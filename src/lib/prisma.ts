import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDbUrl(): string {
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv && fromEnv.trim()) {
    // Support both file:./dev.db and absolute file:/... forms
    if (fromEnv.startsWith("file:")) {
      const raw = fromEnv.slice("file:".length);
      if (raw.startsWith("/") || /^[A-Za-z]:/.test(raw)) {
        return `file:${raw}`;
      }
      return `file:${path.resolve(/* turbopackIgnore: true */ process.cwd(), raw.replace(/^\.\//, ""))}`;
    }
    return fromEnv;
  }
  return `file:${path.resolve(/* turbopackIgnore: true */ process.cwd(), "dev.db")}`;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaLibSql({ url: resolveDbUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
