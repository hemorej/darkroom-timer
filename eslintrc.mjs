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
        ...globals.browser,
      },
    },
    ignores: ["dist/*", "node_modules/*"],
    rules: {
      "no-console": "off",
      "no-debugger": "off",
      "vue/no-multiple-template-root": "off",
      // Modal.vue is only mounted via the parent's v-if, and its name is used as-is.
      "vue/require-toggle-inside-transition": "off",
      "vue/multi-word-component-names": "off",
    },
  },
];
