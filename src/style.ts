import { KARAKURI_THEMES } from "./theme.ts";

const vars = (scheme: "light" | "dark"): string => {
  const set = KARAKURI_THEMES[scheme];
  return `--kk-scheme: ${scheme}; ${Object.entries(set).map(([name, value]) => `--kk-${name}: ${value};`).join(" ")}`;
};

/**
 * THE STYLE the player wears: the colours as custom properties on `.karakuri` (light, and dark when the page asks for it by
 * `prefers-color-scheme` or by `data-theme="dark"` on the root), the layout of the bar, the play area and the buttons, and the one
 * rule that matters for games played with fingers: nothing on the board can be selected, dragged or double-tapped, and the
 * play area stops the page scrolling under a finger only for the games that read a finger's whole path.
 */
export const KARAKURI_STYLE = `
.karakuri { ${vars("light")}
  display: block; width: 100%; max-width: 560px; margin-inline: auto; box-sizing: border-box; color: var(--kk-ink); font: inherit;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .karakuri { ${vars("dark")} } }
:root[data-theme="dark"] .karakuri { ${vars("dark")} }
.karakuri *, .karakuri *::before, .karakuri *::after { box-sizing: border-box; user-select: none; -webkit-user-select: none; }
.karakuri .kk-bar { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 2px 12px; margin: 0 2px 6px; min-height: 4.3em; align-content: flex-start; font-size: .95rem; line-height: 1.4; }
.karakuri .kk-title { font-weight: 700; }
.karakuri .kk-info { color: var(--kk-muted); font-variant-numeric: tabular-nums; flex: 1 1 100%; min-height: 2.8em; }
.karakuri .kk-stage { position: relative; width: 100%; border-radius: 14px; overflow: hidden; background: var(--kk-board); box-shadow: 0 0 0 2px var(--kk-deep); }
.karakuri .kk-canvas { display: block; width: 100%; height: 100%; touch-action: manipulation; cursor: pointer; outline: none; }
.karakuri[data-gesture="drag"] .kk-canvas { touch-action: none; cursor: crosshair; }
.karakuri .kk-card { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 16px; text-align: center; background: color-mix(in srgb, var(--kk-board) 82%, transparent); backdrop-filter: blur(1.5px); }
.karakuri .kk-card[hidden] { display: none; }
.karakuri .kk-card h3 { margin: 0; font-size: 1.5rem; line-height: 1.2; }
.karakuri .kk-card p { margin: 0; max-width: 28ch; line-height: 1.4; }
.karakuri[data-status="won"] .kk-card h3 { color: var(--kk-good); }
.karakuri[data-status="lost"] .kk-card h3 { color: var(--kk-bad); }
.karakuri .kk-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.karakuri .kk-button { min-height: 44px; min-width: 44px; padding: 8px 16px; border: 2px solid var(--kk-accent); border-radius: 12px; background: transparent; color: var(--kk-ink); font: inherit; font-weight: 600; cursor: pointer; }
.karakuri .kk-button[data-main="true"] { background: var(--kk-accent); color: var(--kk-paper); }
.karakuri .kk-button:disabled { opacity: .4; cursor: default; }
.karakuri .kk-button:focus-visible { outline: 3px solid var(--kk-ink); outline-offset: 2px; }
.karakuri .kk-foot { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 8px; }
.karakuri .kk-live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .karakuri .kk-card { backdrop-filter: none; } }
`;
