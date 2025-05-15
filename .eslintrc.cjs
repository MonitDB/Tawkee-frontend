module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended", // Deve ser o último
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
    // project: "./tsconfig.app.json",
  },
  plugins: ["react", "@typescript-eslint", "prettier"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "react/function-component-definition": [
      2,
      { namedComponents: "function-declaration" },
    ],
    "prettier/prettier": [
      "error",
      {
        "endOfLine": "auto",
      },
    ],
    "@typescript-eslint/no-explicit-any": "off"
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: [
    "dist",
    "node_modules",
    "*.cjs",
    "vite.config.ts",
    "src/vite-env.d.ts",
    "**/*.d.ts",
    "build",
    "coverage",
    "public",
    "**/*.min.js",
    "**/vendor/**"
  ],
};
