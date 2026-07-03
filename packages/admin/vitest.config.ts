import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/index.ts",
        "src/types.ts",
        "src/server/index.ts",
        "src/server/adapters.ts",
        "src/server/routers/user.ts",
        "src/server/routers/role.ts",
        "src/server/routers/invitation.ts",
        "src/crud/**/*.ts",
        "src/ui/**/*.tsx",
        "src/ui/**/*.ts",
        "src/auth/**/*.ts",
      ],
      thresholds: { lines: 95, branches: 95 },
    },
  },
});
