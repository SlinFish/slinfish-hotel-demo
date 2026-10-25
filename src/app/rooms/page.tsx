import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RoomCard } from "@/components/room-card";
import { rooms } from "@/features/rooms/catalog";
export default function Rooms() {
  return (
    <>
      <Header />
      <main id="main-content" className="rooms-page section">
        <div className="catalog-heading">
          <span className="eyebrow">A ROOM OF YOUR OWN</span>
          <h1>
            Find your <em>quiet corner.</em>
          </h1>
          <p>Three ways to settle in. One invitation to slow down.</p>
          <p className="form-note">
            Fictional rooms, AI-generated illustrations and illustrative rates.
            No real property is shown; availability is not guaranteed.
          </p>
        </div>
        <div className="room-grid">
          {rooms.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} detailed />
          ))}
        </div>
        <p className="catalog-note">
          Every great stay begins with a conversation. An inquiry is never a
          confirmed reservation.
        </p>
      </main>
      <Footer />
    </>
  );
}
