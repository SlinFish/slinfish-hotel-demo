// AI-generated illustrative imagery for a fictional demonstration hotel.
// These images do not depict an actual hotel or property.
export type Photograph = { src: string | null; alt: string; label: string };
export const photography: Record<
  "hero" | "garden" | "terrace" | "family" | "experience",
  Photograph
> = {
  hero: {
    src: "/images/hero.jpg",
    alt: "AI-generated exterior of The Aster House, a fictional tropical boutique hotel at dusk",
    label: "A slower kind of stay",
  },
  garden: {
    src: "/images/garden.jpg",
    alt: "AI-generated Garden Room with white bedding, green accents and a tropical garden patio",
    label: "Rest, naturally",
  },
  terrace: {
    src: "/images/terrace.jpg",
    alt: "AI-generated Terrace Suite with king bed, seating and a sunset ocean-view balcony",
    label: "Room to unwind",
  },
  family: {
    src: "/images/family.jpg",
    alt: "AI-generated family accommodation with two beds and a view of the tropical garden",
    label: "Better, together",
  },
  experience: {
    src: "/images/experience.jpg",
    alt: "AI-generated outdoor breakfast with fruit, pastries and coffee in a tropical garden",
    label: "The art of doing less",
  },
};
