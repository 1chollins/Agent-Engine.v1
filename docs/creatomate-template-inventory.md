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

## Template 2: TBD
- **Template ID**: *(paste UUID from Creatomate dashboard)*
- **Env var**: `CREATOMATE_TEMPLATE_DAY2_TBD`
- **Theme**:
- **Assigned to**: Day 2
- **Aspect ratio**: 9:16 vertical
- **Duration**:
- **Photo slot count**:
- **Full modifications structure**:
```json
{}
```
- **Notes**:

---

## Template 3: TBD
- **Template ID**: *(paste UUID from Creatomate dashboard)*
- **Env var**: `CREATOMATE_TEMPLATE_DAY3_TBD`
- **Theme**:
- **Assigned to**: Day 5
- **Aspect ratio**: 9:16 vertical
- **Duration**:
- **Photo slot count**:
- **Full modifications structure**:
```json
{}
```
- **Notes**:

---

## Template 4: TBD
- **Template ID**: *(paste UUID from Creatomate dashboard)*
- **Env var**: `CREATOMATE_TEMPLATE_DAY4_TBD`
- **Theme**:
- **Assigned to**: Day 8
- **Aspect ratio**: 9:16 vertical
- **Duration**:
- **Photo slot count**:
- **Full modifications structure**:
```json
{}
```
- **Notes**:

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
4. Add key to `ReelTemplateKey` union in `creatomate-templates.ts`
5. Add env var mapping to `ENV_KEYS`
6. Add template definition to `TEMPLATE_DEFS` with `requiredSlots`
7. Write `build{Name}Modifications()` function in `creatomate.ts`
8. Test via `scripts/test-creatomate.ts` before wiring into pipeline
