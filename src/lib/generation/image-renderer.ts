import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "fs/promises";
import { join } from "path";

let fontDataCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

async function loadFonts(): Promise<{
  regular: ArrayBuffer;
  bold: ArrayBuffer;
}> {
  if (fontDataCache) return fontDataCache;

  // Use Inter from Google Fonts bundled in public/fonts
  const regular = await readFile(
    join(process.cwd(), "public", "fonts", "Inter-Regular.ttf")
  );
  const bold = await readFile(
    join(process.cwd(), "public", "fonts", "Inter-Bold.ttf")
  );

  fontDataCache = {
    regular: regular.buffer as ArrayBuffer,
    bold: bold.buffer as ArrayBuffer,
  };
  return fontDataCache;
}

/** Free-tier watermark overlay for static images (posts + stories). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withWatermark(element: any, width: number): any {
  const scale = width >= 1080 ? 1 : width / 1080;
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
      },
      children: [
        element,
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 24 * scale,
              right: 24 * scale,
              display: "flex",
              padding: `${8 * scale}px ${16 * scale}px`,
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.38)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 22 * scale,
              fontFamily: "Inter",
              fontWeight: 400,
            },
            children: "Made with frameandformstudio.com",
          },
        },
      ],
    },
  };
}

export async function renderToImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: any,
  width: number,
  height: number,
  watermark = false
): Promise<Buffer> {
  const fonts = await loadFonts();

  const finalElement = watermark ? withWatermark(element, width) : element;

  const svg = await satori(finalElement, {
    width,
    height,
    fonts: [
      { name: "Inter", data: fonts.regular, weight: 400, style: "normal" },
      { name: "Inter", data: fonts.bold, weight: 700, style: "normal" },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "original" },
    dpi: 144,
    shapeRendering: 2, // geometricPrecision
    imageRendering: 0, // optimizeQuality
  });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
