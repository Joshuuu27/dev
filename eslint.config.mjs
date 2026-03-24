import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated/service-worker artifacts
    "public/sw.js",
    "public/workbox-*.js",
  ]),
  {
    rules: {
      // This codebase currently uses `any` in many places; don't block builds on it.
      "@typescript-eslint/no-explicit-any": "off",
      // Allow plain quotes/apostrophes in JSX text (common in UI copy).
      "react/no-unescaped-entities": "off",
      // Prefer-const is nice-to-have; don't block CI/dev.
      "prefer-const": "off",
      // Hook deps warnings are useful but noisy; don't block.
      "react-hooks/exhaustive-deps": "warn",
      // TanStack/react-table hooks trigger this rule; don't block.
      "react-hooks/incompatible-library": "off",
      // This plugin flags patterns we intentionally use with refs/callbacks in maps.
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
