import { ArrowIcon } from "@/components/arrow-icon";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { InquiryForm } from "@/components/inquiry-form";
import { RoomCard } from "@/components/room-card";
import { HotelPhoto } from "@/components/hotel-photo";
import { photography } from "@/features/hotel/photography";
import { rooms } from "@/features/rooms/catalog";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ room?: string | string[] }>;
}) {
  const requested = (await searchParams).room;
  const selectedRoom = rooms.find((room) => room.id === requested)?.id;
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-image">
            <HotelPhoto photo={photography.hero} sizes="100vw" preload />
            <div className="hero-shade" />
            <div className="hero-copy">
              <span className="eyebrow light">A LITTLE CLOSER TO YOURSELF</span>
              <h1 id="hero-title">
                Somewhere
                <br />
                to <em>simply be.</em>
              </h1>
              <p>
                Thoughtful spaces. Unhurried days.
                <br />
                The quiet luxury of feeling at home.
              </p>
              <a className="button cream" href="#inquiry">
                Find your moment{" "}
                <span aria-hidden="true">
                  <ArrowIcon />
                </span>
              </a>
            </div>
            <div className="hero-bottom">
              <span>A FICTIONAL BOUTIQUE RETREAT</span>
              <a href="#story">
                SCROLL TO DISCOVER <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>
        <div className="hospitality-strip">
          <span>Intimate by design</span>
          <span aria-hidden="true">✳</span>
          <span>Inspired by nature</span>
          <span aria-hidden="true">✳</span>
          <span>Made for slowing down</span>
        </div>
        <section id="story" className="intro section">
          <div>
            <span className="eyebrow">01 / A WARM WELCOME</span>
            <h2>
              A little more
              <br />
              than <em>a getaway.</em>
            </h2>
          </div>
          <div className="intro-copy">
            <p>
              Some places ask you to do more. We imagine a place that invites
              you to do a little less. A morning with no agenda. A corner to
              call your own. Time, finally, to just be.
            </p>
            <p className="muted">
              The Aster House is a fictional boutique retreat, imagined by
              SlinFish Software to explore the art of thoughtful hospitality.
            </p>
            <Link href="/rooms" className="text-link">
              Make yourself at home{" "}
              <span aria-hidden="true">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </section>
        <section className="rooms-section section">
          <div className="section-head">
            <div>
              <span className="eyebrow">02 / YOUR OWN LITTLE CORNER</span>
              <h2>
                Stay for a night.
                <br />
                <em>Settle in for a while.</em>
              </h2>
            </div>
            <Link className="text-link" href="/rooms">
              Discover the rooms{" "}
              <span aria-hidden="true">
                <ArrowIcon />
              </span>
            </Link>
          </div>
          <div className="room-grid">
            {rooms.map((room, index) => (
              <RoomCard key={room.id} room={room} index={index} />
            ))}
          </div>
        </section>
        <section id="experience" className="experience">
          <div className="experience-art">
            <HotelPhoto
              photo={photography.experience}
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            <span className="image-caption">
              AN ILLUSTRATIVE VISION OF SLOW LIVING
            </span>
          </div>
          <div className="experience-content">
            <span className="eyebrow">03 / THE PLEASURE OF LESS</span>
            <h2>
              Nothing rushed.
              <br />
              <em>Everything felt.</em>
            </h2>
            <p>
              A garden to wander. A quiet place to read. A long breakfast that
              becomes the best part of your day. Simple pleasures inspire our
              fictional retreat.
            </p>
            <ul className="amenity-list">
              <li>
                <span aria-hidden="true">✳</span>
                <div>
                  <h3>Closer to nature</h3>
                  <p>Garden outlooks and spaces to pause.</p>
                </div>
              </li>
              <li>
                <span aria-hidden="true">☼</span>
                <div>
                  <h3>Mornings, your way</h3>
                  <p>A breakfast option for a slower start.</p>
                </div>
              </li>
              <li>
                <span aria-hidden="true">⌂</span>
                <div>
                  <h3>A space for everyone</h3>
                  <p>From a quiet escape to time together.</p>
                </div>
              </li>
            </ul>
            <a href="#inquiry" className="text-link">
              Imagine your stay{" "}
              <span aria-hidden="true">
                <ArrowIcon />
              </span>
            </a>
          </div>
        </section>
        <section id="inquiry" className="inquiry section">
          <div className="inquiry-copy">
            <span className="eyebrow">04 / SOMETHING TO LOOK FORWARD TO</span>
            <h2>
              Your next
              <br />
              <em>slow chapter.</em>
            </h2>
            <p>
              Tell us a little about the stay you have in mind. Start a
              conversation, with no reservation confirmed.
            </p>
            <div className="inquiry-aside">
              <span aria-hidden="true">✳</span>
              <p>
                This is a fictional hotel demonstration.
                <br />
                Please use invented details only.
              </p>
            </div>
          </div>
          <div className="form-panel">
            <span className="eyebrow">LET’S BEGIN</span>
            <h3>A stay worth imagining.</h3>
            <p>Share a few details in our sample inquiry form.</p>
            <InquiryForm selectedRoom={selectedRoom} />
          </div>
        </section>
        <section className="portfolio-callout">
          <div>
            <span className="eyebrow light">BEHIND EVERY WARM WELCOME</span>
            <h2>
              Thoughtful hospitality.
              <br />
              <em>Thoughtful software.</em>
            </h2>
            <p>
              Explore the other side of the experience: a safe, interactive
              hotel inquiry workspace.
            </p>
          </div>
          <Link href="/staff/demo" className="button cream">
            Step inside the staff demo{" "}
            <span aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
