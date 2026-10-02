import { createHmac, timingSafeEqual } from "crypto";

/**
 * Unguessable share links for a campaign: `<packageId>.<signature>`.
 *
 * The signature is an HMAC of the package id, so a link can't be forged or
 * walked to another campaign, and no database column or migration is
 * needed. Set SHARE_LINK_SECRET to rotate (which revokes every link sent so
 * far); it falls back to the service-role key, which is already a server
 * secret on every deploy.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function secret(): string {
  const s = process.env.SHARE_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("SHARE_LINK_SECRET (or SUPABASE_SERVICE_ROLE_KEY) is not set");
  return s;
}

function sign(packageId: string): string {
  return createHmac("sha256", secret()).update(`campaign-share:${packageId}`).digest("base64url").slice(0, 24);
}

export function shareTokenFor(packageId: string): string {
  return `${packageId}.${sign(packageId)}`;
}

export function shareUrlFor(packageId: string): string {
  return `https://studio.frameandformstudio.com/share/${shareTokenFor(packageId)}`;
}

/** Package id for a valid token, otherwise null. */
export function verifyShareToken(token: string): string | null {
  const [packageId, sig] = decodeURIComponent(token).split(".");
  if (!packageId || !sig || !UUID_RE.test(packageId)) return null;
  const expected = sign(packageId);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return packageId;
}
