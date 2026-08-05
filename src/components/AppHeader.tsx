import Link from "next/link";

export function AppHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Viewdding 홈">
        <span className="brand-kicker">WEDDING VENUE ARCHIVE</span>
        <span className="brand-name">Viewdding</span>
      </Link>
    </header>
  );
}
