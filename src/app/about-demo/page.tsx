import { ArrowIcon } from "@/components/arrow-icon";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
export const metadata: Metadata = {
  title: "About this demo | The Aster House",
};
export default function AboutDemo() {
  return (
    <>
      <Header />
      <main id="main-content" className="section about-demo">
        <span className="eyebrow">THE IDEA BEHIND THE EXPERIENCE</span>
        <h1>
          Hospitality, <em>imagined.</em>
        </h1>
        <p className="about-lead">
          The Aster House is a fictional hotel concept, designed and developed
          by{" "}
          <a href="https://slinfish.github.io/portfolio/">SlinFish Software</a>{" "}
          to demonstrate thoughtful web design and interactive hospitality
          software.
        </p>
        <section aria-labelledby="concept-heading">
          <h2 id="concept-heading">A concept, brought to life.</h2>
          <p>
            Hotel images are AI-generated illustrations, not photographs of an
            actual property. Room descriptions, amenities and prices are
            illustrative. No real accommodation or reservations are available.
          </p>
        </section>
        <section aria-labelledby="demo-heading">
          <h2 id="demo-heading">Explore both sides of the welcome.</h2>
          <p>
            The public showcase inquiry form uses fixed sample contact details.
            You can explore dates, room preferences and guest counts; nothing is
            sent or stored, and no reservation is made.
          </p>
          <p>
            The public staff dashboard uses entirely fictional customer
            inquiries. Search, filtering and status changes are simulated in
            your browser and reset when the page reloads. It has no access to
            operational guest records.
          </p>
          <Link className="text-link" href="/staff/demo">
            Explore the staff demo <ArrowIcon />
          </Link>
        </section>
        <section aria-labelledby="creator-heading">
          <h2 id="creator-heading">Made with care.</h2>
          <p>
            Discover more work by{" "}
            <a href="https://slinfish.github.io/portfolio/">
              SlinFish Software
            </a>
            , or return to <Link href="/">The Aster House</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
