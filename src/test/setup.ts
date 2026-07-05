import "dotenv/config";
import { vi, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

// Server actions call Next.js request-scoped APIs (headers, cache tags, the
// router) that only work inside an actual request. Mock them so the actions
// can be called directly from tests while still exercising real Prisma
// queries against the local dev database.

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// The local dev Postgres (WASM, effectively single-connection) can drop
// connections if a test file's pool is left open when the next one starts.
afterAll(async () => {
  await prisma.$disconnect();
});
