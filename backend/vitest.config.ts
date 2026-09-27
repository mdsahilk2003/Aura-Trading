import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    fileParallelism: false,
    hookTimeout: 300000,
    testTimeout: 60000,
  },
});
