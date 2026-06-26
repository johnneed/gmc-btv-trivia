module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  settings: {
    react: { version: "detect" },
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  rules: {
    "semi": [2, "always"],
    "quotes": [2, "double", { avoidEscape: true }],
    "object-curly-spacing": ["error", "always"],
    "react/react-in-jsx-scope": "off",
  },
};
