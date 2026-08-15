import Link from "next/link";

export function AppHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Viewdding 홈">
        <span className="brand-kicker">WEDDING PLACE ARCHIVE</span>
        <span className="brand-name">Viewdding</span>
      </Link>
      <nav className="site-links" aria-label="서비스 메뉴">
        <Link href="/search/">Wedding Hall</Link>
        <Link href="/gatherings/?purpose=invitation">Invitation</Link>
        <Link href="/gatherings/?purpose=family_meeting">Family Meeting</Link>
        <Link href="/methodology/">Info</Link>
      </nav>
    </header>
  );
}
