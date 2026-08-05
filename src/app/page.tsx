import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Viewdding | 결혼 준비를 위한 장소 찾기",
  description: "서울 웨딩홀과 청첩장 모임·상견례 장소를 조건별로 찾아보세요.",
};

export default function HomePage() {
  return (
    <section className="landing-page">
      <div className="landing-background" aria-hidden="true" />

      <header className="landing-header">
        <Link className="landing-brand" href="/" aria-label="Viewdding 홈">
          Viewdding
        </Link>
        <Link className="landing-guide-link" href="/methodology/">
          Wedding Guide
        </Link>
      </header>

      <div className="landing-copy">
        <h1>WEDDING GUIDE</h1>
        <p className="landing-subtitle">Every moment begins with a place.</p>
        <p className="landing-description">
          결혼식의 첫 장소부터 소중한 사람들과의 만남까지,<br className="landing-desktop-break" />
          한곳에서 차분하게 찾아보세요.
        </p>

        <nav className="landing-actions" aria-label="Viewdding 서비스">
          <Link className="landing-action" href="/search/">
            <span>WEDDING VENUE</span>
            <strong>웨딩홀 찾기</strong>
            <i aria-hidden="true">→</i>
          </Link>
          <Link className="landing-action" href="/gatherings/">
            <span>WEDDING GATHERING</span>
            <strong>청첩장 모임·상견례 장소</strong>
            <i aria-hidden="true">→</i>
          </Link>
        </nav>
      </div>

      <p className="landing-footer">VIEWDDING · FOR EVERY WEDDING MOMENT</p>
    </section>
  );
}
