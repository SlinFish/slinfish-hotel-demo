import Link from "next/link";
export function Header() {
  return (
    <header className="header">
      <Link className="brand" href="/">
        <span className="brand-icon">✳</span> THE ASTER HOUSE{" "}
        <span className="brand-sub">BOUTIQUE RETREAT</span>
      </Link>
      <nav>
        <Link href="/#story">Our story</Link>
        <Link href="/rooms">Stay with us</Link>
        <Link href="/#experience">Experiences</Link>
        <Link href="/#inquiry" className="nav-cta">
          Inquire now ↗
        </Link>
      </nav>
    </header>
  );
}
