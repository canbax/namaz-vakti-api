// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "coverage/",
      "node_modules/", // Ignore node_modules
      "dist/", // Ignore the dist folder
      "*.min.js", // Ignore all minified JavaScript files
      "public/assets/", // Ignore all files in the public/assets/ folder
    ],
  },
);
