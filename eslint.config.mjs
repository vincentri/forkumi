import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    settings: {
      next: {
        rootDir: ["apps/api/", "apps/web/"],
      },
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "apps/*/.next/**",
    "coverage/**",
    "dist/**",
    "node_modules/**",
    "out/**",
    "pnpm-lock.yaml",
  ]),
]);
