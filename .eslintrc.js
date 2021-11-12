module.exports = {
  env: {
    browser: false,
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["promise"],
  rules: {
    "promise/always-return": "error",
    "promise/no-return-wrap": "error",
    "promise/param-names": "error",
    "promise/catch-or-return": "error",
    "promise/no-new-statics": "error",
    "promise/no-return-in-finally": "error",
  },
};
