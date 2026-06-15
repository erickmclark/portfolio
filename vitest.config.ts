import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    // Mirror the `@/*` path alias from tsconfig.json
    alias: { "@": process.cwd() },
  },
});
