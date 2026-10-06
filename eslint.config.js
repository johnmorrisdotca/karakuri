import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";

export default tseslint.config(
  { ignores: ["dist/", "site/", "node_modules/", "test-results/", "playwright-report/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["e2e/**/*.mjs", "playwright.config.mjs"], languageOptions: { globals: { PointerEvent: "readonly", performance: "readonly", requestAnimationFrame: "readonly", console: "readonly", URL: "readonly", document: "readonly", window: "readonly", location: "readonly", customElements: "readonly", getComputedStyle: "readonly", localStorage: "readonly" } } },
  { files: ["scripts/**/*.mjs"], languageOptions: { globals: { console: "readonly", URL: "readonly", document: "readonly", performance: "readonly" } } },
  { files: ["demo/**/*.js"], languageOptions: { globals: { document: "readonly", window: "readonly", location: "readonly", history: "readonly", navigator: "readonly", URLSearchParams: "readonly", Intl: "readonly", setInterval: "readonly", setTimeout: "readonly", localStorage: "readonly", familyLanguage: "readonly" } } },
  { files: ["src/**/*.ts", "scripts/**/*.mjs", "demo/**/*.js", "e2e/**/*.mjs"], plugins: { unicorn }, rules: { "unicorn/filename-case": ["error", { case: "kebabCase" }] } },
);
