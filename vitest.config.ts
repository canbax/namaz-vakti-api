/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      exclude: [
        "*.js",
        "src/types.ts",
        "**/*.spec.ts",
        "**/*.test.ts",
        "public/assets/**",
      ],
      reporter: ["json-summary"],
    },
  },
});
