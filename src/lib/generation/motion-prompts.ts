import type { ContentTag } from "@/types/listing";

export const STYLE_GUARD =
  "Photorealistic real estate footage. No people. No added or removed objects. Subtle smooth camera movement only.";

const MOTION_PROMPTS: Record<ContentTag, string> = {
  kitchen:
    "Slow push-in toward the kitchen island and countertops, holding focus on cabinetry and natural light.",
  bathroom:
    "Slow push-in toward the vanity and shower, holding focus on tile and fixtures with steady framing.",
  bedroom:
    "Gentle push-in toward the bed and headboard, soft warm light, framing held centered.",
  living_room:
    "Slow push-in across the seating area toward the focal wall, revealing depth and warm interior light.",
  dining_room:
    "Slow push-in toward the dining table centerpiece, holding the table centered as detail emerges.",
  exterior_front:
    "Slow push-in toward the front door of the home, steady framing with the facade centered.",
  exterior_back:
    "Slow push-in across the back patio toward the yard, holding the yard centered with even light.",
  exterior_aerial:
    "Slow descending push-in toward the property from above, holding the home centered in frame.",
  pool:
    "Slow push-in across the pool water toward the back of the property, calm reflections, centered framing.",
  garage:
    "Slow push-in toward the garage door and driveway, steady framing, even daylight.",
  office:
    "Slow push-in toward the desk and bookshelf, holding the workspace centered with soft natural light.",
  closet:
    "Slow push-in down the center of the closet toward the back wall, shelves and hanging space framed evenly.",
  hallway:
    "Slow push-in down the hallway toward the far end, doorways framed symmetrically on either side.",
  detail_shot:
    "Very slow push-in on the fixture or finish, holding the detail centered with shallow focus shift.",
  view:
    "Slow tilt up revealing the view from the property, horizon held centered with steady framing.",
  other:
    "Very subtle slow push-in, holding the subject centered with minimal camera movement.",
};

export function getMotionPrompt(tag: ContentTag | null): string {
  const key: ContentTag = tag ?? "other";
  const base = MOTION_PROMPTS[key] ?? MOTION_PROMPTS.other;
  return `${base} ${STYLE_GUARD}`;
}
