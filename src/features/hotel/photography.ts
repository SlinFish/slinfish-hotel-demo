// Populate src only after downloading and verifying a licensed local photograph.
// See docs/IMAGES.md. Never hotlink an unverified asset or invent an attribution.
export type Photograph = { src: string | null; alt: string; label: string };
export const photography: Record<
  "hero" | "garden" | "terrace" | "family" | "experience",
  Photograph
> = {
  hero: {
    src: null,
    alt: "A quiet boutique retreat surrounded by lush greenery",
    label: "A slower kind of stay",
  },
  garden: {
    src: null,
    alt: "An inviting bedroom in soft natural tones",
    label: "Rest, naturally",
  },
  terrace: {
    src: null,
    alt: "A bright suite with a comfortable sitting area",
    label: "Room to unwind",
  },
  family: {
    src: null,
    alt: "A spacious room for a relaxed family stay",
    label: "Better, together",
  },
  experience: {
    src: null,
    alt: "A peaceful outdoor space for unhurried mornings",
    label: "The art of doing less",
  },
};
