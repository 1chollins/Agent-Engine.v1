/**
 * Agent branding for reels: the extra props every reel variant accepts, and
 * the color math that turns an agent's brand colors into text that stays
 * readable over any photo.
 *
 * Every field is optional so pieces rendered before these existed (and their
 * retries) still validate against the schemas.
 */
import { z } from "zod";

export const reelExtrasShape = {
  /** Agent brand colors (hex). */
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().nullable().optional(),
  /** On-screen phrases written for this reel (content_pieces.text_overlay). */
  overlayPhrases: z.array(z.string()).optional(),
  agentName: z.string().optional(),
  phone: z.string().optional(),
  agentHeadshotUrl: z.string().optional(),
  /** Listing facts used by the editorial / cinematic styles. */
  address: z.string().optional(),
  cityLine: z.string().optional(),
  priceLabel: z.string().optional(),
  stats: z.array(z.string()).optional(),
  /** Sound effects on cuts. Defaults to on. */
  sfx: z.boolean().optional(),
  /**
   * Wording overrides for host (short-term rental) campaigns. Unset for
   * realtor campaigns, so each style keeps its own sale wording.
   */
  heroLabel: z.string().optional(),
  priceKicker: z.string().optional(),
  ctaLine: z.string().optional(),
};

export type ReelExtras = {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string | null;
  overlayPhrases?: string[];
  agentName?: string;
  phone?: string;
  agentHeadshotUrl?: string;
  address?: string;
  cityLine?: string;
  priceLabel?: string;
  stats?: string[];
  sfx?: boolean;
  heroLabel?: string;
  priceKicker?: string;
  ctaLine?: string;
};

const FALLBACK_HIGHLIGHT = "#E8BE84"; // warm gold
const FALLBACK_SOLID = "#2F4A3A"; // deep green

type RGB = { r: number; g: number; b: number };

export function hexToRgb(hex: string | null | undefined): RGB | null {
  if (!hex) return null;
  const m = hex.trim().replace(/^#/, "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: RGB): string {
  const h = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** WCAG relative luminance, 0 (black) – 1 (white). */
export function luminance(c: RGB): number {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
}

function saturation(c: RGB): number {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  return max === 0 ? 0 : (max - min) / max;
}

/**
 * The brand color used for highlighted caption words over photos. Prefers a
 * colorful brand color (accent, then primary, then secondary) and lightens it
 * until it reads on a dark scrim. Greys and near-whites fall back to gold.
 */
export function highlightColor(extras: ReelExtras): string {
  const candidates = [extras.accentColor, extras.primaryColor, extras.secondaryColor]
    .map(hexToRgb)
    .filter((c): c is RGB => c !== null && saturation(c) > 0.18);
  const base = candidates[0];
  if (!base) return FALLBACK_HIGHLIGHT;
  let c = base;
  for (let i = 0; i < 6 && luminance(c) < 0.3; i++) {
    c = mix(c, { r: 255, g: 255, b: 255 }, 0.22);
  }
  return toHex(c);
}

/** A solid brand color for cards and end screens (dark enough for white text). */
export function solidColor(extras: ReelExtras): string {
  const c = hexToRgb(extras.primaryColor) ?? hexToRgb(extras.secondaryColor);
  if (!c) return FALLBACK_SOLID;
  let out = c;
  for (let i = 0; i < 6 && luminance(out) > 0.22; i++) {
    out = mix(out, { r: 0, g: 0, b: 0 }, 0.18);
  }
  return toHex(out);
}

/** Black or white, whichever reads on the given background. */
export function textOn(bgHex: string): string {
  const c = hexToRgb(bgHex);
  if (!c) return "#ffffff";
  return luminance(c) > 0.45 ? "#14140f" : "#ffffff";
}

export function withAlpha(hex: string, alpha: number): string {
  const c = hexToRgb(hex);
  if (!c) return `rgba(0,0,0,${alpha})`;
  return `rgba(${c.r},${c.g},${c.b},${alpha})`;
}

const CTA_WORDS = /\b(call|text|dm|message|contact|schedule|book|tour today|link in bio|reach out)\b/i;

/**
 * Descriptive phrases only — drops the closing call-to-action (and anything
 * naming the agent), for styles that end on their own agent card.
 */
export function descriptivePhrases(phrases: string[] | undefined, agentName?: string): string[] {
  const name = (agentName ?? "").trim().toLowerCase();
  return (phrases ?? [])
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !CTA_WORDS.test(p) && !(name && p.toLowerCase().includes(name)));
}

/**
 * Phrases to show across `slots` scenes. Keeps the reel's closing phrase
 * (the CTA / agent name, by the prompt's rules) on the last scene.
 */
export function phrasesForSlots(phrases: string[] | undefined, slots: number): (string | null)[] {
  const clean = (phrases ?? []).map((p) => p.trim()).filter(Boolean);
  const out: (string | null)[] = Array.from({ length: slots }, () => null);
  if (clean.length === 0) return out;
  if (clean.length <= slots) {
    clean.forEach((p, i) => {
      out[i] = p;
    });
    return out;
  }
  for (let i = 0; i < slots - 1; i++) out[i] = clean[i];
  out[slots - 1] = clean[clean.length - 1];
  return out;
}
