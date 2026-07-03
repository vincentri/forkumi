import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/__tests__/setup.ts",
        "src/index.ts",
        "src/types.ts",
        "src/**/*.tsx",
        "src/router-factory.ts",
        "src/schema-builder.ts",
        "src/field-visibility.ts",
      ],
      thresholds: { lines: 95, branches: 95 },
    },
  },
});
