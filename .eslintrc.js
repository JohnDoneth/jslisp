module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb-base"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    quotes: ["error", "double"],
    "import/no-extraneous-dependencies": [
      "error",
      { devDependencies: ["**/*.test.mjs"] },
    ],
    "import/extensions": ["never"],
  },
};
