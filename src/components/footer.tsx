import { ArrowIcon } from "@/components/arrow-icon";
import Link from "next/link";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link className="brand" href="/">
            <span className="brand-icon" aria-hidden="true">
              ✳
            </span>{" "}
            THE ASTER HOUSE
          </Link>
          <p>A quieter pace. A warmer welcome.</p>
        </div>
        <nav aria-label="Footer">
          <Link href="/rooms">Find your room</Link>
          <Link href="/#inquiry">Plan a stay</Link>
          <Link href="/staff/demo">
            Explore the staff demo <ArrowIcon />
          </Link>
          <Link href="/about-demo">About this demo</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <small>The Aster House — A fictional hotel concept</small>
        <small>
          Designed &amp; developed by{" "}
          <a href="https://slinfish.github.io/portfolio/">SlinFish Software</a>
        </small>
      </div>
    </footer>
  );
}
