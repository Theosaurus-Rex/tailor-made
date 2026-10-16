import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

function banLayers(dir, banned) {
  return [
    "error",
    {
      patterns: banned.map((layer) => ({
        group: [`**/${layer}`, `**/${layer}/**`],
        message: `src/${dir} must not import from ${layer}. Layers depend downward only: links, domain, game.`,
      })),
    },
  ];
}

const DETERMINISM = "Challenges must be deterministic. Take randomness and time as inputs.";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ["eslint.config.js"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    files: ["src/game/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    rules: {
      "no-restricted-imports": banLayers("game", [
        "domain",
        "links",
        "features",
        "components",
        "lib",
      ]),
    },
  },
  {
    files: ["src/domain/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    rules: {
      "no-restricted-imports": banLayers("domain", ["links", "features", "components", "lib"]),
    },
  },
  {
    files: ["src/links/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    rules: {
      "no-restricted-imports": banLayers("links", ["features", "components", "lib"]),
    },
  },
  {
    files: ["src/domain/**/*.{ts,tsx,js,jsx,mjs,cjs}", "src/game/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    rules: {
      "no-restricted-properties": [
        "error",
        { object: "Math", property: "random", message: DETERMINISM },
      ],
      "no-restricted-globals": ["error", { name: "Date", message: DETERMINISM }],
    },
  },
  eslintConfigPrettier,
);
