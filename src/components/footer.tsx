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
          <p>
            A quieter pace. A warmer welcome.
            <br />A fictional boutique retreat by SlinFish Software.
          </p>
        </div>
        <nav aria-label="Footer">
          <Link href="/rooms">Find your room</Link>
          <Link href="/#inquiry">Plan a stay</Link>
          <Link href="/staff/demo">
            Explore the staff demo <ArrowIcon />
          </Link>
          <Link href="/staff">Protected staff access</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <small>© 2026 SLINFISH SOFTWARE</small>
        <small>
          Fictional hotel · illustrative imagery & rates · inquiries only
        </small>
      </div>
    </footer>
  );
}
