import Link from "next/link";
import { Header } from "@/components/header";
import { InquiryForm } from "@/components/inquiry-form";
import { rooms } from "@/features/rooms/catalog";
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-image">
            <div className="hero-copy">
              <span className="eyebrow light">AN UNHURRIED KIND OF LUXURY</span>
              <h1>
                Somewhere
                <br />
                <em>to simply be.</em>
              </h1>
              <p>
                Thoughtful spaces, warm hospitality, and the freedom to slow
                down.
              </p>
              <a className="hero-link" href="#inquiry">
                Plan your stay <span>↗</span>
              </a>
            </div>
            <div className="hero-stamp">
              THE ART OF
              <br />
              SLOW LIVING
              <br />
              <b>✳</b>
            </div>
          </div>
        </section>
        <section id="story" className="intro section">
          <div>
            <span className="eyebrow">WELCOME TO THE ASTER HOUSE</span>
            <h2>
              A little more
              <br />
              <em>than a getaway.</em>
            </h2>
          </div>
          <div>
            <p>
              There are places you visit, and places that stay with you. Aster
              House is a fictional boutique retreat inspired by intimate
              hospitality, lush surroundings, and beautifully simple moments.
            </p>
            <p className="muted">
              Designed as a functional web development demonstration by SlinFish
              Software.
            </p>
            <Link href="/rooms" className="text-link">
              Discover our rooms ↗
            </Link>
          </div>
        </section>
        <section className="rooms-section section">
          <div className="section-head">
            <div>
              <span className="eyebrow">STAY A LITTLE LONGER</span>
              <h2>
                Rooms made
                <br />
                <em>for slowing down.</em>
              </h2>
            </div>
            <Link className="text-link" href="/rooms">
              Explore all rooms ↗
            </Link>
          </div>
          <div className="room-grid">
            {rooms.map((room, index) => (
              <article className="room-card" key={room.id}>
                <div className={"room-photo " + room.gradient}>
                  <span className="room-number">0{index + 1} / 03</span>
                  <span className="room-photo-label">{room.category}</span>
                </div>
                <div className="room-info">
                  <div>
                    <h3>{room.name}</h3>
                    <p>
                      {room.size} · Up to {room.occupancy} guests
                    </p>
                  </div>
                  <Link
                    href="/#inquiry"
                    aria-label={"Inquire about " + room.name}
                  >
                    ↗
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="experience" className="experience">
          <div className="experience-art">
            <span>✳</span>
          </div>
          <div className="experience-content">
            <span className="eyebrow">THE ASTER EXPERIENCE</span>
            <h2>
              Find beauty in
              <br />
              <em>the everyday.</em>
            </h2>
            <p>
              Slow mornings, thoughtful details, and spaces that make you feel
              right at home. Our favorite kind of luxury is the kind that lets
              you unwind.
            </p>
            <a href="#inquiry" className="text-link">
              Make an inquiry ↗
            </a>
          </div>
        </section>
        <section id="inquiry" className="inquiry section">
          <div className="inquiry-copy">
            <span className="eyebrow">YOUR NEXT CHAPTER</span>
            <h2>
              We saved
              <br />
              <em>you a place.</em>
            </h2>
            <p>
              Tell us when you’d like to visit. This demo collects booking
              inquiries, not confirmed reservations.
            </p>
            <div className="inquiry-decoration">✳</div>
          </div>
          <div className="form-panel">
            <h3>Start your stay</h3>
            <p>Share a few details and we&apos;ll take it from there.</p>
            <InquiryForm />
          </div>
        </section>
      </main>
      <footer>
        <div>
          <strong>✳ THE ASTER HOUSE</strong>
          <p>
            A fictional hospitality experience.
            <br />
            Built by SlinFish Software.
          </p>
        </div>
        <div>
  <Link href="/rooms">Rooms</Link>
  <Link href="/#inquiry">Inquire</Link>
  <Link href="/staff">Staff demo</Link>
</div>
        <small>© 2026 THE ASTER HOUSE · DEMONSTRATION ONLY</small>
      </footer>
    </>
  );
}
