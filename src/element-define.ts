import { KarakuriBoard } from "./element.ts";

// Importing this file defines <karakuri-board> on the page (and does nothing where there is no page).
if (typeof customElements !== "undefined" && customElements.get("karakuri-board") === undefined) customElements.define("karakuri-board", KarakuriBoard);

export { KarakuriBoard };
