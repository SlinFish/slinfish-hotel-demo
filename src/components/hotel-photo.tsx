import Image from "next/image";
import type { Photograph } from "@/features/hotel/photography";
export function HotelPhoto({
  photo,
  sizes,
  preload = false,
}: {
  photo: Photograph;
  sizes: string;
  preload?: boolean;
}) {
  if (photo.src)
    return (
      <Image
        src={photo.src}
        alt={`${photo.alt}. Fictional hotel illustration; not an actual property.`}
        fill
        sizes={sizes}
        preload={preload}
        className="hotel-photo"
      />
    );
  return (
    <div className="photo-pending">
      <span aria-hidden="true">✳</span>
      <span>{photo.label}</span>
      <small>Illustrative image unavailable</small>
    </div>
  );
}
