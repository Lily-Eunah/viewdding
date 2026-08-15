import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Viewdding | 결혼 준비를 위한 장소 찾기",
  description: "전국 주요 지역 웨딩홀과 청첩장 모임·상견례 장소를 조건별로 찾아보세요.",
};

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">본문으로 바로가기</a>
      <section id="main-content" className="landing-page landing-page-reference">
        <img
          src="/viewdding-home-clean-v63.png"
          alt=""
          aria-hidden="true"
          className="landing-reference-image"
          decoding="sync"
          fetchPriority="high"
        />
        <header className="landing-crisp-brand" aria-label="Viewdding"><span>Viewdding</span></header>
        <section className="landing-crisp-copy" aria-labelledby="landing-title">
          <h1 id="landing-title">Wedding Archive</h1>
          <p>결혼을 준비하는 모든 순간을,<br />하나의 기록으로 남겨요.</p>
        </section>
        <nav className="landing-crisp-entry" aria-label="Viewdding 서비스 시작">
          <Link className="landing-crisp-cta" href="/search/">
            <span>Wedding Hall 둘러보기</span><span className="landing-crisp-arrow" aria-hidden="true">→</span>
          </Link>
          <Link className="landing-crisp-cta" href="/gatherings/?purpose=invitation">
            <span>Invitation 청첩장 모임</span><span className="landing-crisp-arrow" aria-hidden="true">→</span>
          </Link>
          <Link className="landing-crisp-cta" href="/gatherings/?purpose=family_meeting">
            <span>Family Meeting 상견례</span><span className="landing-crisp-arrow" aria-hidden="true">→</span>
          </Link>
          <Link className="landing-crisp-cta" href="/self-snap/">
            <span>Self Snap 셀프스냅 & 장소</span><span className="landing-crisp-arrow" aria-hidden="true">→</span>
          </Link>
          <Link className="landing-crisp-cta" href="/essentials/">
            <span>Wedding Essentials 결혼 준비물</span><span className="landing-crisp-arrow" aria-hidden="true">→</span>
          </Link>
          <Link className="landing-crisp-cta" href="/wedding-color/">
            <span>Personal Color 웨딩 퍼스널 컬러</span><span className="landing-crisp-arrow" aria-hidden="true">→</span>
          </Link>
        </nav>
        <p className="landing-crisp-footer">Viewdding · For every wedding moment</p>
      </section>
    </>
  );
}
