import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      "node-v20.12.2-darwin-arm64/**",
      "coverage/**",
      "dist/**"
    ]
  },
  ...nextCoreWebVitals,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-effect": "off"
    }
  },
  {
    files: ["**/*.config.{js,mjs,cjs}", "**/*.config.{ts,mts}"],
    rules: {
      "import/no-anonymous-default-export": "off"
    }
  }
];

export default config;
