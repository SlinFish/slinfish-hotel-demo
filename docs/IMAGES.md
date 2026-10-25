# AI-generated hotel illustrations

The Aster House is a fictional demonstration hotel. All five images below are **AI-generated illustrations, not photographs of an actual hotel, room, amenity or location**. They illustrate a design concept and do not establish real availability or property features.

## Asset inventory

The assets were supplied on `feature/hotel-ai-images` in commit `32b0b1d95b049e89bd0a3b9481984d152b2811c5`. No image binary was changed during the test-fix/integration-validation task. The generation provider, model and prompts are not recorded in the repository; no third-party stock-photo source or license is claimed.

| Local asset                    | Dimensions | File size     | Illustrative subject                                                |
| ------------------------------ | ---------- | ------------- | ------------------------------------------------------------------- |
| `public/images/hero.jpg`       | 1672 × 941 | 417,080 bytes | Tropical hotel entrance at dusk, with fictional Aster House signage |
| `public/images/garden.jpg`     | 1400 × 933 | 245,299 bytes | White bedding, green accents and a garden patio                     |
| `public/images/terrace.jpg`    | 1400 × 788 | 215,277 bytes | King bed, seating area and sunset balcony                           |
| `public/images/family.jpg`     | 1400 × 788 | 224,622 bytes | Two beds and a garden outlook                                       |
| `public/images/experience.jpg` | 1400 × 788 | 307,433 bytes | Fruit, pastries and coffee at an outdoor garden table               |

Total source size: 1,409,711 bytes (about 1.34 MiB). These local files require no external image service. Visual review found no visible people or unrelated brand marks; the hero uses fictional hotel signage.

## Integration and delivery

`src/features/hotel/photography.ts` maps the five local paths to descriptive AI-generated alternative text. `HotelPhoto` appends the fictional-property context without calling the illustrations photographs. The homepage uses the hero, all three room images and the breakfast illustration; `/rooms` uses the appropriate three room images.

`next/image` provides responsive `srcset`/`sizes`, optimized delivery and reserved container dimensions. The hero is preloaded; secondary images are lazy-loaded. Images use `object-fit: cover`, retaining their intrinsic proportions while cropping to the existing responsive containers. The original JPEGs are already bounded to 1400–1672px wide; retain them and let Next generate appropriately sized responses rather than shipping larger originals or introducing a new image dependency.

Detailed fictional-property and AI-image disclosures are centralized on `/about-demo`, linked discreetly from the footer. Descriptive, truthful image alternative text is retained. The guest inquiry disclaimer and public staff-demo isolation remain unchanged.

## Historical context

Earlier Phase 1/Task 02 work left placeholders because external photograph source/license verification was blocked. That describes those historical commits only. This branch now supplies all five AI-generated assets, so the old missing-image and stock-photo-access blockers do not apply to the current integration. The earlier [Task 02 acceptance report](ACCEPTANCE.md) is retained as a historical record.

## Integration verification — 2026-10-25

- Chromium checked `/`, `/rooms` and `/staff/demo` at 1440, 768 and 390px. All expected images decoded successfully with descriptive AI-generated/property-disclaimer alt text, responsive `sizes`/`srcset`, and `object-fit: cover`; secondary images are lazy-loaded. No horizontal page overflow was found.
- A sample optimized hero request at 750px with WebP support returned a 750 × 422 WebP of 76,834 bytes, compared with the 417,080-byte source JPEG. This verifies optimized delivery; it is not a Lighthouse/Core Web Vitals benchmark.
- Captures were retained outside the checkout at `/workspace/acceptance/ai-images/` for desktop/tablet/mobile review. The five source JPEGs remain byte-for-byte identical to the starting commit.
- The public demo passed its behavior/security checks with an unreachable database URL and no staff token. It made no API requests; unauthenticated staff GET/PATCH returned 401. A separate inspection of four HTML responses and eleven referenced client scripts found no application secret-variable names, database URL or test database marker.
- Typecheck, all 16 automated tests, lint and production build passed on Node 22.16.0. The focused six-test demo suite also passed on Node 22.23.4. No migrations or deployment were performed.

## Static showcase delivery

`npm run build:demo` copies these five JPEGs unchanged and uses `images.unoptimized` for static hosting. No image optimizer endpoint or paid image service is required; secondary images remain lazy-loaded and use proportional cover cropping in reserved containers. The full server mode retains Next optimization. See CLOUDFLARE.md for the separate public artifact and validation record.
