import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
    // The local Prisma dev Postgres (WASM) doesn't reliably handle several
    // separate connection pools opened/closed in quick succession. Run all
    // test files in one shared module registry so they reuse the single
    // Prisma client singleton (src/lib/prisma.ts) instead of each opening
    // (and tearing down) their own pool.
    fileParallelism: false,
    isolate: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
