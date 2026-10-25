import { ArrowIcon } from "@/components/arrow-icon";
import Link from "next/link";
export function Header() {
  return (
    <header className="header">
      <Link className="brand" href="/">
        <span className="brand-icon" aria-hidden="true">
          ✳
        </span>
        <span>
          THE ASTER HOUSE<small className="brand-sub">A BOUTIQUE RETREAT</small>
        </span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#story">Our story</Link>
        <Link href="/rooms">The rooms</Link>
        <Link href="/#experience">Slow living</Link>
        <Link href="/staff/demo">Staff demo</Link>
        <Link href="/#inquiry" className="nav-cta">
          Plan your stay{" "}
          <span aria-hidden="true">
            <ArrowIcon />
          </span>
        </Link>
      </nav>
    </header>
  );
}
