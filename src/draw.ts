// draw.ts: the few drawing helpers the games share, on a 2D canvas context.

/** A rounded rectangle path. */
export function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const k = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + k, y);
  g.lineTo(x + w - k, y);
  g.arcTo(x + w, y, x + w, y + k, k);
  g.lineTo(x + w, y + h - k);
  g.arcTo(x + w, y + h, x + w - k, y + h, k);
  g.lineTo(x + k, y + h);
  g.arcTo(x, y + h, x, y + h - k, k);
  g.lineTo(x, y + k);
  g.arcTo(x, y, x + k, y, k);
  g.closePath();
}

/** A filled disc, with an outline when `edge` is given. */
export function disc(g: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, edge?: string, edgeWidth = 2): void {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fillStyle = fill;
  g.fill();
  if (edge !== undefined) {
    g.lineWidth = edgeWidth;
    g.strokeStyle = edge;
    g.stroke();
  }
}

/** Text centred on a point. */
export function label(g: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, colour: string, font: string, weight = 700): void {
  g.font = `${weight} ${size}px ${font}`;
  g.fillStyle = colour;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, x, y);
}

/** A colour with its alpha set (for hex colours of the form #rrggbb). */
export function alpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
}

/** A colour mixed with white (`amount` above 0) or black (below 0), for the lit and shaded sides of a shape. */
export function shade(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const mix = (i: number): number => {
    const v = parseInt(h.slice(i, i + 2), 16);
    return Math.round(amount >= 0 ? v + (255 - v) * amount : v * (1 + amount));
  };
  return `rgb(${mix(0)}, ${mix(2)}, ${mix(4)})`;
}

/** The colours of the plain pieces (blocks, tubes), chosen to be told apart and to read on both the light and the dark floor. */
export const PIECE_COLOURS = ["#4f86f7", "#e4694b", "#3fae7a", "#9a6fd6", "#f0a53a", "#2fb3c6", "#d95f9b", "#7e8aa3", "#8bb83f", "#c85c3a"] as const;
