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

// The real "next-auth" package fails to resolve "next/server" under Vitest's
// Node environment. Actions only need the AuthError class for instanceof
// checks, so a minimal stand-in avoids loading the real package.
vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {},
}));

// vitest.config.ts runs with isolate:false and fileParallelism:false so every
// test file shares one Prisma client (see below). setupFiles re-run this
// module once per test file, and each run of this factory would normally
// hand back a brand new vi.fn(). But non-mocked production modules (like
// fermes/[farmId]/actions.ts) are only ever imported once and keep whichever
// mock instance existed at that time — so a later test file updating "its"
// mock would silently update a disconnected instance nobody reads from.
// Caching the mock functions on globalThis keeps a single shared instance
// across every test file.
type AuthMocks = { auth: ReturnType<typeof vi.fn>; signIn: ReturnType<typeof vi.fn> };
const globalForAuthMock = globalThis as unknown as { __authMocks__?: AuthMocks };
const authMocks: AuthMocks =
  globalForAuthMock.__authMocks__ ?? (globalForAuthMock.__authMocks__ = { auth: vi.fn(), signIn: vi.fn() });

vi.mock("@/lib/auth", () => authMocks);

// Invitation emails would otherwise hit real Gmail SMTP (and require real
// GMAIL_USER/GMAIL_APP_PASSWORD) during tests. Same shared-instance reasoning
// as above.
type MailerMocks = { sendMail: ReturnType<typeof vi.fn> };
const globalForMailerMock = globalThis as unknown as { __mailerMocks__?: MailerMocks };
const mailerMocks: MailerMocks =
  globalForMailerMock.__mailerMocks__ ??
  (globalForMailerMock.__mailerMocks__ = {
    sendMail: vi.fn().mockResolvedValue({ error: null }),
  });

vi.mock("@/lib/mailer", () => ({
  sendMail: mailerMocks.sendMail,
  EMAIL_FROM: "CREOLE PSF <test@test.local>",
  getAppUrl: () => "http://localhost:3000",
}));

// The local dev Postgres (WASM, effectively single-connection) can drop
// connections if a test file's pool is left open when the next one starts.
afterAll(async () => {
  await prisma.$disconnect();
});
