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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function renderToImage(
  element: any,
  width: number,
  height: number
): Promise<Buffer> {
  const fonts = await loadFonts();

  const svg = await satori(element, {
    width,
    height,
    fonts: [
      { name: "Inter", data: fonts.regular, weight: 400, style: "normal" },
      { name: "Inter", data: fonts.bold, weight: 700, style: "normal" },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
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
