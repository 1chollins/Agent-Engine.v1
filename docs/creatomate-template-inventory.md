# Creatomate Template Inventory

8 templates powering the 14-day content package. Each template is designed in Creatomate's editor, assigned a UUID, and registered in `src/lib/generation/creatomate-templates.ts` via env var.

---

## Template 1: Just Listed — Property Stats
- **Template ID**: `9b317da0-dbcd-466e-92fd-311a1b0d82eb`
- **Env var**: `CREATOMATE_TEMPLATE_DAY1_JUST_LISTED`
- **Theme**: Just Listed
- **Assigned to**: Day 2 reel
- **Aspect ratio**: 9:16 vertical
- **Duration**: *(seconds)*
- **Photo slot count**: 5
- **Full modifications structure**:
```json
{
  "Text.text": "Just Listed",
  "Address.text": "123 Main St,\nCity, ST 12345",
  "Details-1.text": "3 Beds\n2 Baths\n1,800 sqft",
  "Details-2.text": "$450,000\n0.25 acres\nBuilt 2015",
  "Photo-1.source": "<signed_url>",
  "Photo-2.source": "<signed_url>",
  "Photo-3.source": "<signed_url>",
  "Photo-4.source": "<signed_url>",
  "Photo-5.source": "<signed_url>",
  "Name.text": "Jane Smith",
  "Brand-Name.text": "Keller Williams Realty",
  "Phone-Number.text": "(555) 123-4567",
  "Email.text": "jane@example.com",
  "Picture.source": "<headshot_signed_url>"
}
```
- **Notes**: Already built and tested via `scripts/test-creatomate.ts`. Builder function: `buildJustListedModifications()` in `src/lib/generation/creatomate.ts`.

---

## Template 2: Story — Triple Slide
- **Template ID**: `cb090682-5313-44e9-8973-183251e07dfd`
- **Env var**: `CREATOMATE_TEMPLATE_STORY_TRIPLE_SLIDE`
- **Theme**: Triple Slide
- **Assigned to**: TBD (story slot)
- **Aspect ratio**: 9:16 vertical (720x1280)
- **Duration**: 13 seconds
- **Photo slot count**: 3
- **Full modifications structure**:
```json
{
  "Image-1.source": "<signed_url>",
  "Image-2.source": "<signed_url>",
  "Image-3.source": "<signed_url>",
  "Text.text": "Austin, TX"
}
```
- **Notes**: Builder function: `buildTripleSlideStoryModifications()` in `src/lib/generation/creatomate.ts`. Not yet wired into pipeline.

---

## Template 3: Reel — Simple Showcase
- **Template ID**: `de8d6882-d1f2-4bc5-ba1f-f25168c362c6`
- **Env var**: `CREATOMATE_TEMPLATE_REEL_SIMPLE_SHOWCASE`
- **Theme**: Simple Showcase
- **Assigned to**: Random rotation across reel days 5/8/11/14
- **Aspect ratio**: 9:16 vertical (720x1280)
- **Duration**: 12 seconds
- **Photo slot count**: 4
- **Full modifications structure**:
```json
{
  "Image-1.source": "<signed_url>",
  "Image-2.source": "<signed_url>",
  "Image-3.source": "<signed_url>",
  "Image-4.source": "<signed_url>",
  "Brand-Name.text": "Keller Williams Realty",
  "Brand-Logo.source": "<logo_signed_url>",
  "URL.text": "janesmith.kw.com"
}
```
- **Notes**: Builder function: `buildSimpleShowcaseReelModifications()` in `src/lib/generation/creatomate.ts`. Falls back to "Link in bio" when `brand_profiles.website` is null. Not yet wired into pipeline.

---

## Template 4: Story — Four Scene
- **Template ID**: `f3727bc7-fa3c-475a-aac9-4f8726458b7b`
- **Env var**: `CREATOMATE_TEMPLATE_STORY_FOUR_SCENE`
- **Theme**: Four Scene Story
- **Assigned to**: Random rotation across story days (3, 6, 9, 12) alongside story_triple_slide
- **Aspect ratio**: 9:16 vertical (720x1280) at 60fps
- **Duration**: 23 seconds (4 compositions: 5s + 6s + 6s + 6s)
- **Photo slot count**: 4
- **Full modifications structure**:
```json
{
  "Background-1.source": "<signed_url>",
  "Background-2.source": "<signed_url>",
  "Background-3.source": "<signed_url>",
  "Background-4.source": "<signed_url>",
  "Text-1.text": "New Listing: Austin",
  "Text-2.text": "3 bed · 2 bath · 1,800 sqft",
  "Text-3.text": "123 Main St",
  "Text-4.text": "janesmith.kw.com"
}
```
- **Notes**: Text content uses city, property stats, address, and website (fallback "Link in bio for full tour"). Video background slots were converted to image in template JSON so all 4 backgrounds accept photo URLs from the picker. Music element was removed from the template JSON — renders silent. Builder function: `buildFourSceneStoryModifications()` in `src/lib/generation/creatomate.ts`. Not yet wired into pipeline.

---

## Template 5: TBD
- **Template ID**: *(paste UUID from Creatomate dashboard)*
- **Env var**: `CREATOMATE_TEMPLATE_DAY5_TBD`
- **Theme**:
- **Assigned to**: Day 11
- **Aspect ratio**: 9:16 vertical
- **Duration**:
- **Photo slot count**:
- **Full modifications structure**:
```json
{}
```
- **Notes**:

---

## Template 6: TBD
- **Template ID**: *(paste UUID from Creatomate dashboard)*
- **Env var**: `CREATOMATE_TEMPLATE_DAY6_TBD`
- **Theme**:
- **Assigned to**: Day 14
- **Aspect ratio**: 9:16 vertical
- **Duration**:
- **Photo slot count**:
- **Full modifications structure**:
```json
{}
```
- **Notes**:

---

## Template 7: TBD
- **Template ID**: *(paste UUID from Creatomate dashboard)*
- **Env var**: `CREATOMATE_TEMPLATE_DAY7_TBD`
- **Theme**:
- **Assigned to**: TBD
- **Aspect ratio**: 9:16 vertical
- **Duration**:
- **Photo slot count**:
- **Full modifications structure**:
```json
{}
```
- **Notes**:

---

## Template 8: TBD
- **Template ID**: *(paste UUID from Creatomate dashboard)*
- **Env var**: `CREATOMATE_TEMPLATE_DAY8_TBD`
- **Theme**:
- **Assigned to**: TBD
- **Aspect ratio**: 9:16 vertical
- **Duration**:
- **Photo slot count**:
- **Full modifications structure**:
```json
{}
```
- **Notes**:

---

## Registration checklist

For each new template:
1. Design template in Creatomate editor
2. Copy template UUID from Creatomate dashboard
3. Add UUID to `.env.local` as `CREATOMATE_TEMPLATE_DAY{N}_{NAME}`
4. Add key to `ContentTemplateKey` union in `creatomate-templates.ts`
5. Add env var mapping to `ENV_KEYS`
6. Add template definition to `TEMPLATE_DEFS` with `requiredSlots`
7. Write `build{Name}Modifications()` function in `creatomate.ts`
8. Test via `scripts/test-creatomate.ts` before wiring into pipeline
