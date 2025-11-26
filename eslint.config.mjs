import next from "eslint-config-next";

export default [
  ...next(),
  {
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Additional performance and code quality rules
      "no-console": "warn",
      "no-unused-vars": "error",
      "prefer-const": "error",
      "no-var": "error"
    },
    // Ignore node_modules and build directories
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "build/"
    ]
  }
];