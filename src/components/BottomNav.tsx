import Link from "next/link";

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      <Link href="/"><span aria-hidden="true">⌂</span><span>홈</span></Link>
      <Link href="/search/"><span aria-hidden="true">⌕</span><span>찾기</span></Link>
      <Link href="/favorites/"><span aria-hidden="true">♡</span><span>저장</span></Link>
      <Link href="/methodology/"><span aria-hidden="true">☷</span><span>기준</span></Link>
    </nav>
  );
}
