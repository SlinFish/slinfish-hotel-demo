import Link from "next/link";
import { Header } from "@/components/header";
import { rooms } from "@/features/rooms/catalog";
export default function Rooms() {
  return (
    <>
      <Header />
      <main className="rooms-page section">
        <span className="eyebrow">ACCOMMODATION</span>
        <h1>
          Find your <em>space.</em>
        </h1>
        <p className="muted">
          Three ways to feel at home. Illustrative room details and prices only.
        </p>
        <div className="room-grid">
          {rooms.map((r) => (
            <article className="room-card" key={r.id}>
              <div className={"room-photo " + r.gradient}></div>
              <div className="room-info">
                <div>
                  <h3>{r.name}</h3>
                  <p>{r.description}</p>
                  <p>
                    {r.size} · Sleeps {r.occupancy}
                  </p>
                  <p>Illustrative rates from ${r.priceFrom}/night</p>
                  <ul>
                    {r.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link href="/#inquiry" className="button dark">
                Inquire about this room ↗
              </Link>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
