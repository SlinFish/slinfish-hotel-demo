# Illustrative photography

The Aster House is fictional. No photograph may be represented as depicting an actual Aster House property, room, amenity or location.

## Current asset blocker

During Phase 1, the cloud proxy initially rejected `images.unsplash.com` with HTTP 403. Draft network additions for `unsplash.com` and `images.unsplash.com` were saved. Subsequent image requests succeeded, but the official license page (`https://unsplash.com/license`), source-photo pages and public search requests returned only `Authorization required`. This prevents verification of original photo attribution and license eligibility. Download access alone does not establish a right to use an image.

No photographic files have been added, and no image license or attribution is claimed. The design uses clearly labeled, solid-color pending-photography panels rather than synthetic photographs, hotlinks or gradient image imitations. Consequently the mandatory photography deliverable remains incomplete until access and licensing verification are available.

## Asset slots

| Local target                   | Intended subject                           | Required attribution before inclusion                            |
| ------------------------------ | ------------------------------------------ | ---------------------------------------------------------------- |
| `public/images/hero.jpg`       | Boutique retreat exterior / lush courtyard | Original photo URL, photographer, license URL and retrieval date |
| `public/images/garden.jpg`     | Calm bedroom in natural tones              | Same                                                             |
| `public/images/terrace.jpg`    | Bright suite with seating                  | Same                                                             |
| `public/images/family.jpg`     | Spacious family accommodation              | Same                                                             |
| `public/images/experience.jpg` | Peaceful garden / outdoor breakfast space  | Same                                                             |

After verification, download optimized local images (roughly 1600–2000px hero, 1000–1200px other images; avoid large originals). Record actual sources, authors, exact license terms and any restrictions here; keep any required license notices. Check for identifiable people, branding and property restrictions. Set each `src` and accurate descriptive `alt` in `src/features/hotel/photography.ts` only after the corresponding file exists. Do not infer a photograph's license from a template repository's code license.

`HotelPhoto` uses `next/image`, responsive `sizes`, lazy loading for secondary images and hero preloading. No image-domain configuration or remote requests are needed after assets are local. All photography remains explicitly illustrative in the interface.
