import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.d.ts",
        "src/app/**/*.ts",
        "src/crud/**/*.ts",
        "src/lib/trpc/**/*.ts",
        "src/lib/public-files.ts",
        "src/server/router.ts",
        "src/server/routers/**/*.ts",
      ],
      thresholds: { lines: 95, branches: 95 },
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
