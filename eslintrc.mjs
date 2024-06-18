import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/prettier",
  ),
  {
    languageOptions: {
      globals: {
        ...globals.node,
        _: true,
      },
    },
    ignores: ["dist/*", "node_modules/*"],
    rules: {
      "no-console": "off",
      "no-debugger": "off",
      "vue/no-multiple-template-root": "off",
    },
  },
];
