/* eslint-env node */
module.exports = {
  extends: [
    "eslint:recommended",
    "@react-native-community",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:storybook/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["simple-import-sort"],
  root: true,
  rules: {
    "arrow-parens": ["error", "as-needed"],
    "array-bracket-spacing": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/member-ordering": "off",
    "sort-keys": "off",
    "no-console": "warn",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "react/jsx-curly-brace-presence": [
      "error",
      {
        props: "never",
        children: "never",
      },
    ],
    "react/jsx-no-bind": "off",
    "react/jsx-handler-names": [
      "error",
      {
        eventHandlerPrefix: "handleOn",
      },
    ],
    "react/react-in-jsx-scope": "off",
    "react/self-closing-comp": [
      "error",
      {
        component: true,
      },
    ],
    "react-hooks/exhaustive-deps": "warn",
    "react-native/no-unused-styles": "error",
    "react-native/split-platform-components": "error",
    "react-native/no-color-literals": "off",
    "react-native/no-raw-text": "off",
    "react-native/sort-styles": [
      "error",
      "asc",
      {
        ignoreClassNames: false,
        ignoreStyleProperties: false,
      },
    ],
  },
};
