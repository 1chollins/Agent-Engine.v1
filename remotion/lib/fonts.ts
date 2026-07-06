/**
 * Inter font loading — same font files the Satori static-post pipeline
 * uses (public/fonts/), so all 14 package pieces share typography.
 *
 * Uses the browser FontFace API + delayRender directly instead of the
 * @remotion/fonts package — one less version-pinned dependency.
 *
 * Call loadInterFonts() once at module scope in Root.tsx.
 */
import { continueRender, delayRender, staticFile } from "remotion";

export const FONT_FAMILY =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

let started = false;

export function loadInterFonts(): void {
  if (started) {
    return;
  }
  started = true;

  const handle = delayRender("Loading Inter fonts");

  Promise.all([
    new FontFace(
      "Inter",
      `url('${staticFile("fonts/Inter-Regular.ttf")}') format('truetype')`,
      { weight: "400" }
    ).load(),
    new FontFace(
      "Inter",
      `url('${staticFile("fonts/Inter-Bold.ttf")}') format('truetype')`,
      { weight: "700" }
    ).load(),
  ])
    .then((fonts) => {
      for (const font of fonts) {
        document.fonts.add(font);
      }
      continueRender(handle);
    })
    .catch((err) => {
      // Fall back to system fonts rather than failing the render.
      console.error("Inter font load failed:", err);
      continueRender(handle);
    });
}
