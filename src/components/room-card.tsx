import { ArrowIcon } from "@/components/arrow-icon";
import Link from "next/link";
import { rooms } from "@/features/rooms/catalog";
import { photography } from "@/features/hotel/photography";
import { HotelPhoto } from "./hotel-photo";
export function RoomCard({
  room,
  index,
  detailed = false,
}: {
  room: (typeof rooms)[number];
  index: number;
  detailed?: boolean;
}) {
  return (
    <article className="room-card">
      <div className="room-photo">
        <HotelPhoto
          photo={photography[room.id]}
          sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
        />
        <span className="room-number">0{index + 1} / 03</span>
        <span className="room-photo-label">{room.category}</span>
      </div>
      <div className="room-info">
        <div>
          <span className="room-spec">
            {room.size} <span aria-hidden="true">/</span> UP TO {room.occupancy}{" "}
            GUESTS
          </span>
          <h3>{room.name}</h3>
          <p>{room.description}</p>
        </div>
        <span className="room-rate">
          From <strong>${room.priceFrom}</strong>
          <small>/ night</small>
        </span>
      </div>
      {detailed && (
        <ul className="room-features">
          {room.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      )}
      <Link href={`/?room=${room.id}#inquiry`} className="room-inquire">
        Explore a stay <span className="sr-only">in the {room.name}</span>
        <span aria-hidden="true">
          <ArrowIcon />
        </span>
      </Link>
    </article>
  );
}
