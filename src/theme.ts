import type { Theme } from "./controller.ts";

/** The look the games draw with, as custom properties, so a page can change any of them. Light and dark follow the page. */
export const KARAKURI_THEMES = {
  light: { board: "#f6f1e6", deep: "#e4dcc9", ink: "#2b2a28", muted: "#8a8473", accent: "#2f6f55", good: "#2f8f5b", bad: "#c2453a", gold: "#e0a82e", water: "#3b8fd9", lava: "#e8561f", stone: "#8d8a82", paper: "#fffdf7" },
  dark: { board: "#263029", deep: "#1a211c", ink: "#f1ecdf", muted: "#9aa393", accent: "#6fcf97", good: "#6fcf97", bad: "#ef7a6e", gold: "#f0be4a", water: "#5aa9ee", lava: "#f27a45", stone: "#a7a399", paper: "#fffdf7" },
} as const;

const NAMES = Object.keys(KARAKURI_THEMES.light) as (keyof typeof KARAKURI_THEMES.light)[];

/** Reads the theme a game draws with from an element's computed style: each colour is `--kk-<name>`, with the light or the dark default beneath. */
export function readTheme(element: Element): Theme {
  const style = getComputedStyle(element);
  const scheme = style.getPropertyValue("--kk-scheme").trim() === "dark" ? "dark" : "light";
  const base = KARAKURI_THEMES[scheme];
  const theme = { dark: scheme === "dark", font: style.fontFamily || "system-ui, sans-serif", lang: "en" } as Record<string, string | boolean>;
  for (const name of NAMES) theme[name] = style.getPropertyValue(`--kk-${name}`).trim() || base[name];
  return theme as unknown as Theme;
}

/** The theme without a page: the light one, for a drawing made where there is no style to read (a test, a server). */
export function defaultTheme(dark = false): Theme {
  return { ...KARAKURI_THEMES[dark ? "dark" : "light"], dark, font: "system-ui, sans-serif", lang: "en" };
}
