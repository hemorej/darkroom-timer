module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: ["plugin:vue/essential"],

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  },

  parserOptions: {
    parser: 'babel-eslint'
  },

  globals: {
    "_": true
  },

  'extends': [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/prettier'
  ]
};
