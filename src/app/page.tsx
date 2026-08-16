import type { Metadata } from "next";
import Link from "next/link";
import { MainMagazineCards } from "@/components/MainMagazineCards";
import { MainCurationShowcase } from "@/components/MainCurationShowcase";

export const metadata: Metadata = {
  title: "Viewdding | 감성 웨딩 아카이브 & 스마트 큐레이션",
  description: "전국 웨딩홀 엑셀 리스트, 청첩장 모임·상견례 프라이빗 다이닝, 셀프스냅 룩북, D-Day 필수 준비물까지 결혼 준비의 모든 발품을 하나의 아카이브로 모았습니다.",
};

const QUICK_CHIPS = [
  { label: "웨딩홀 엑셀 다운로드", href: "/search/" },
  { label: "상견례 룸 다이닝", href: "/gatherings/?purpose=family_meeting" },
  { label: "청첩장 모임 장소", href: "/gatherings/?purpose=invitation" },
  { label: "셀프스냅 룩북", href: "/self-snap/" },
  { label: "D-Day 필수 준비물", href: "/essentials/" },
  { label: "웨딩 퍼스널 컬러", href: "/wedding-color/" },
];

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">본문으로 바로가기</a>
      <div className="home-editorial-container">
        {/* Hero Section */}
        <section id="main-content" className="home-hero-section" aria-labelledby="hero-title">
          <div className="home-hero-bg-wrapper" aria-hidden="true">
            <img
              src="/viewdding-home-clean-v63.png"
              alt=""
              className="home-hero-bg-image"
              decoding="sync"
              fetchPriority="high"
            />
            <div className="home-hero-overlay" />
          </div>

          <div className="home-hero-content">
            <span className="home-hero-kicker">CURATED WEDDING ARCHIVE</span>
            <h1 id="hero-title" className="home-hero-title">
              Wedding Archive
            </h1>
            <p className="home-hero-subtitle">
              결혼을 준비하는 모든 순간의 발품을,<br />
              정돈되고 감각적인 하나의 아카이브로 남겨요.
            </p>

            {/* Quick Action Chips */}
            <div className="home-hero-chips" aria-label="빠른 메뉴 이동">
              {QUICK_CHIPS.map((chip) => (
                <Link key={chip.label} href={chip.href} className="home-chip-link">
                  {chip.label}
                </Link>
              ))}
            </div>

            <div className="home-hero-scroll-indicator" aria-hidden="true">
              <span className="scroll-mouse" />
              <span className="scroll-text">SCROLL TO EXPLORE</span>
            </div>
          </div>
        </section>

        {/* 6 Core Solutions Grid */}
        <MainMagazineCards />

        {/* Curation Showcases (Affiliate, Sponsored Spaces, Excel CTA) */}
        <MainCurationShowcase />

        {/* Editorial Footer */}
        <footer className="home-editorial-footer">
          <div className="footer-inner">
            <div className="footer-brand-col">
              <span className="footer-brand-logo">Viewdding</span>
              <p className="footer-brand-tagline">
                For every couple crafting their timeless wedding moment.
              </p>
              <p className="footer-copyright">
                © {new Date().getFullYear()} Viewdding Archive. All rights reserved.
              </p>
            </div>
            <div className="footer-links-col">
              <h3 className="footer-col-title">Archive Directory</h3>
              <ul className="footer-link-list">
                <li><Link href="/search/">전국 웨딩홀 탐색 &amp; 엑셀</Link></li>
                <li><Link href="/gatherings/?purpose=invitation">청첩장 모임 룸식당</Link></li>
                <li><Link href="/gatherings/?purpose=family_meeting">상견례 코스 다이닝</Link></li>
                <li><Link href="/self-snap/">셀프스냅 드레스 &amp; 장소</Link></li>
                <li><Link href="/essentials/">D-Day 웨딩 준비물</Link></li>
                <li><Link href="/wedding-color/">웨딩 퍼스널 컬러 진단</Link></li>
              </ul>
            </div>
            <div className="footer-links-col">
              <h3 className="footer-col-title">Partnership &amp; Guide</h3>
              <ul className="footer-link-list">
                <li><Link href="/methodology/">데이터 수집 및 신뢰도 기준</Link></li>
                <li><a href="mailto:partner@viewdding.com">입점 및 제휴 광고 문의</a></li>
                <li><Link href="/favorites/">나의 보관함 (즐겨찾기)</Link></li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
