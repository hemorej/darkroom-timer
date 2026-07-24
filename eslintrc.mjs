import globals from "globals";
import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import prettier from "@vue/eslint-config-prettier";

export default [
  js.configs.recommended,
  ...vue.configs["flat/essential"],
  prettier,
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
