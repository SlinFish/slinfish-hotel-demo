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

## Task 02 verification — 2026-10-25

No photograph was approved, downloaded or added during this task. All five `src` values remain `null`; their Phase 1 placeholders and fictional-hotel disclaimer are preserved.

| Asset            | Source/photographer/license verification | Outcome                                   |
| ---------------- | ---------------------------------------- | ----------------------------------------- |
| `hero.jpg`       | Not established                          | Preserve courtyard/exterior placeholder   |
| `garden.jpg`     | Not established                          | Preserve bedroom placeholder              |
| `terrace.jpg`    | Not established                          | Preserve suite placeholder                |
| `family.jpg`     | Not established                          | Preserve family accommodation placeholder |
| `experience.jpg` | Not established                          | Preserve garden/breakfast placeholder     |

Observed provider-level blockers:

- `https://unsplash.com/license` responds with HTTP 307 to `/.within.website?redir=%2Flicense`; following the redirect produces HTTP 401. Its initial response body is `Authorization required`. A successful image-CDN request does not verify a photo's source, author, free-versus-premium status, or license.
- `https://www.pexels.com/license/` is denied by the cloud proxy with CONNECT HTTP 403. The required `www.pexels.com`, `pexels.com`, and `images.pexels.com` additions were saved to the environment configuration draft, preserving existing destinations. They are not applied in the observed running policy.

To resume sourcing, review and save those Pexels network additions in environment settings. Recheck access to the original photo and license pages before selecting any assets. If Unsplash remains behind its authorization check, use accessible free Pexels sources or provide the original assets together with verifiable source/license evidence. Do not infer rights, use a template's code license as photo permission, or replace these placeholders until verification succeeds. An absence of visible people or branding is a separate check and does not prove usage rights.

Image crop, aesthetic consistency, recognizable-person/branding review, and optimized JPEG delivery remain **unassessed**, because there are no approved photographs. See [the visual acceptance record](ACCEPTANCE.md) for the independently completed layout and behavior checks.
