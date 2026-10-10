import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  // Root the config explicitly so Vite never walks up into a parent project.
  root: resolve(__dirname),
  test: {
    environment: "node",
    globals: true,
    restoreMocks: true,
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/generated/**", "src/tools/!(meta).ts"],
    },
  },
});
