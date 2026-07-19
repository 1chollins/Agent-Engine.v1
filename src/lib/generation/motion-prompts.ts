import type { ContentTag } from "@/types/listing";

export const STYLE_GUARD =
  "Photorealistic real estate footage. No people. No added or removed objects. Subtle smooth camera movement only.";

/**
 * Camera move options per room type.
 *
 * Each tag carries several moves rather than one. Previously every tag but
 * `view` was a slow push-in, so a reel was four to six consecutive shots all
 * pushing in at the same rate — the thing that most makes generated property
 * video feel mechanical. Varying the move between shots is what reads as an
 * edit rather than a batch render.
 *
 * Moves stay within what a real operator would do in that room: no orbits in a
 * closet, no craning inside a hallway. The STYLE_GUARD still forbids people and
 * any added or removed objects, which is what keeps the output honest enough to
 * put next to a listing.
 */
const MOTION_PROMPTS: Record<ContentTag, string[]> = {
  kitchen: [
    "Slow push-in toward the kitchen island and countertops, holding focus on cabinetry and natural light.",
    "Slow pan across the counters and backsplash, cabinetry passing evenly through frame.",
    "Slow pull back from the island, revealing the full kitchen and its natural light.",
  ],
  bathroom: [
    "Slow push-in toward the vanity and shower, holding focus on tile and fixtures with steady framing.",
    "Slow tilt down from the shower head to the vanity, tile held sharp throughout.",
    "Slow pan across the tile and fixtures, framing held level.",
  ],
  bedroom: [
    "Gentle push-in toward the bed and headboard, soft warm light, framing held centered.",
    "Slow pull back from the bed, revealing the full bedroom and window light.",
    "Slow pan from the window across to the bed, warm light moving through frame.",
  ],
  living_room: [
    "Slow push-in across the seating area toward the focal wall, revealing depth and warm interior light.",
    "Slow pull back from the focal wall, revealing the full seating area and ceiling height.",
    "Slow pan across the living space, furniture passing evenly through frame.",
  ],
  dining_room: [
    "Slow push-in toward the dining table centerpiece, holding the table centered as detail emerges.",
    "Slow pull back from the table, revealing the full dining setting and light fixture.",
    "Slow pan around the dining table, chairs passing evenly through frame.",
  ],
  exterior_front: [
    "Slow push-in toward the front door of the home, steady framing with the facade centered.",
    "Slow rise revealing the facade from driveway level, roofline entering frame.",
    "Slow pan across the frontage and landscaping, facade held level.",
  ],
  exterior_back: [
    "Slow push-in across the back patio toward the yard, holding the yard centered with even light.",
    "Slow pull back from the yard, revealing the patio and rear of the home.",
    "Slow pan across the back of the property, even daylight throughout.",
  ],
  exterior_aerial: [
    "Slow descending push-in toward the property from above, holding the home centered in frame.",
    "Slow orbit around the property from above, home held centered.",
    "Slow rise and pull back from the home, revealing the lot and surroundings.",
  ],
  pool: [
    "Slow push-in across the pool water toward the back of the property, calm reflections, centered framing.",
    "Slow pan along the pool edge, water and decking passing evenly through frame.",
    "Slow rise revealing the pool and surrounding deck, calm reflections held.",
  ],
  garage: [
    "Slow push-in toward the garage door and driveway, steady framing, even daylight.",
    "Slow pan across the garage frontage and driveway, framing held level.",
  ],
  office: [
    "Slow push-in toward the desk and bookshelf, holding the workspace centered with soft natural light.",
    "Slow pull back from the desk, revealing the full workspace and window light.",
  ],
  closet: [
    "Slow push-in down the center of the closet toward the back wall, shelves and hanging space framed evenly.",
    "Slow pan across the shelving and hanging space, framing held level.",
  ],
  hallway: [
    "Slow push-in down the hallway toward the far end, doorways framed symmetrically on either side.",
    "Slow pull back down the hallway, doorways receding symmetrically.",
  ],
  detail_shot: [
    "Very slow push-in on the fixture or finish, holding the detail centered with shallow focus shift.",
    "Very slow pan across the finish, texture held sharp in shallow focus.",
  ],
  view: [
    "Slow tilt up revealing the view from the property, horizon held centered with steady framing.",
    "Slow pan across the horizon, view held level throughout.",
    "Slow push-in toward the view, horizon held centered.",
  ],
  other: [
    "Very subtle slow push-in, holding the subject centered with minimal camera movement.",
    "Very subtle slow pull back, holding the subject centered with minimal camera movement.",
  ],
};

/**
 * Stable hash so a given photo always resolves to the same move.
 *
 * This matters beyond determinism: clip-cache keys on (photo_id, prompt_hash),
 * so a prompt that varied per call would miss the cache every time and re-bill
 * a Kling render for a photo already rendered.
 */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Builds the motion prompt for a photo.
 *
 * `seed` should be the photo id — it selects which camera move this photo gets,
 * giving variety across a reel while staying stable for caching.
 */
export function getMotionPrompt(
  tag: ContentTag | null,
  seed?: string
): string {
  const key: ContentTag = tag ?? "other";
  const options = MOTION_PROMPTS[key] ?? MOTION_PROMPTS.other;
  const base = seed
    ? options[hashSeed(seed) % options.length]
    : options[0];
  return `${base} ${STYLE_GUARD}`;
}

/** Exposed for tests and for auditing prompt coverage. */
export function getMotionVariants(tag: ContentTag | null): string[] {
  const key: ContentTag = tag ?? "other";
  return [...(MOTION_PROMPTS[key] ?? MOTION_PROMPTS.other)];
}
