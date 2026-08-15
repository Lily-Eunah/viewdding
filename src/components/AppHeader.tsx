"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X, Heart, Sparkle } from "@phosphor-icons/react";

interface MenuItem {
  num: string;
  enTitle: string;
  koTitle: string;
  desc: string;
  href: string;
  tag?: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    num: "01",
    enTitle: "Wedding Hall",
    koTitle: "전국 웨딩홀 탐색 & 엑셀",
    desc: "서울 및 수도권 웨딩홀 조건 검색 및 엑셀 다운로드",
    href: "/search/",
    tag: "엑셀 다운로드",
  },
  {
    num: "02",
    enTitle: "Gathering & Dining",
    koTitle: "청첩장 모임 & 상견례",
    desc: "프라이빗 룸, 코스, 주차 조건별 맞춤 다이닝",
    href: "/gatherings/?purpose=invitation",
    tag: "프라이빗 룸",
  },
  {
    num: "03",
    enTitle: "Self Snap & Style",
    koTitle: "셀프스냅 룩북 & 스팟",
    desc: "취향별 야외/스튜디오 스냅 의상과 감성 장소 큐레이션",
    href: "/self-snap/",
    tag: "스타일 룩북",
  },
  {
    num: "04",
    enTitle: "Wedding Essentials",
    koTitle: "D-Day 필수 준비물",
    desc: "투어·스냅·본식 당일 멘붕을 방지하는 필수 준비물",
    href: "/essentials/",
    tag: "체크리스트",
  },
  {
    num: "05",
    enTitle: "Personal Color",
    koTitle: "웨딩 퍼스널 컬러",
    desc: "내 피부톤과 체형에 맞는 드레스 & 예복 컬러 진단",
    href: "/wedding-color/",
    tag: "신부·신랑 진단",
  },
  {
    num: "06",
    enTitle: "Data & Guide",
    koTitle: "데이터 아카이브 안내",
    desc: "광고 없는 객관적인 정보 기준과 수집 원칙",
    href: "/methodology/",
  },
];

export function AppHeader() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  // 라우트 변경 시 드로어 닫기
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // ESC 키로 드로어 닫기 & 스크롤 잠금
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen]);

  return (
    <>
      <header className="site-header-lux">
        <div className="header-inner">
          <Link className="brand-lux" href="/" aria-label="Viewdding 홈">
            <span className="brand-kicker-lux">WEDDING PLACE ARCHIVE</span>
            <span className="brand-name-lux">Viewdding</span>
          </Link>

          <div className="header-actions">
            <Link href="/favorites/" className="header-icon-btn" aria-label="즐겨찾기 보관함">
              <Heart size={20} weight={pathname === "/favorites" ? "fill" : "regular"} />
              <span className="header-btn-label">보관함</span>
            </Link>

            <button
              type="button"
              className="header-menu-btn"
              onClick={() => setIsDrawerOpen(true)}
              aria-expanded={isDrawerOpen}
              aria-controls="site-drawer"
              aria-label="전체 메뉴 열기"
            >
              <List size={22} weight="regular" />
              <span className="menu-btn-text">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* 우측 사이드 드로어 메뉴 */}
      <div
        id="site-drawer"
        className={`site-drawer-container ${isDrawerOpen ? "is-open" : ""}`}
        aria-hidden={!isDrawerOpen}
      >
        <div
          className="drawer-backdrop"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />

        <aside className="drawer-panel" aria-label="전체 서비스 메뉴">
          <div className="drawer-header">
            <div className="drawer-brand">
              <span className="drawer-brand-kicker">CURATED ARCHIVE</span>
              <span className="drawer-brand-title">Viewdding</span>
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="메뉴 닫기"
            >
              <X size={24} weight="regular" />
            </button>
          </div>

          <nav className="drawer-nav">
            <ul className="drawer-menu-list">
              {MENU_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]));

                return (
                  <li key={item.num} className="drawer-menu-item">
                    <Link
                      href={item.href}
                      className={`drawer-menu-link ${isActive ? "is-active" : ""}`}
                    >
                      <div className="drawer-link-meta">
                        <span className="drawer-link-num">{item.num}</span>
                        {item.tag && <span className="drawer-link-tag">{item.tag}</span>}
                      </div>
                      <div className="drawer-link-content">
                        <div className="drawer-link-titles">
                          <span className="drawer-link-en">{item.enTitle}</span>
                          <span className="drawer-link-ko">{item.koTitle}</span>
                        </div>
                        <p className="drawer-link-desc">{item.desc}</p>
                      </div>
                      <span className="drawer-link-arrow" aria-hidden="true">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="drawer-footer">
            <div className="drawer-footer-card">
              <div className="drawer-footer-card-header">
                <Sparkle size={18} weight="fill" className="card-sparkle-icon" />
                <strong>입점 및 제휴 문의</strong>
              </div>
              <p>웨딩홀, 상견례 다이닝, 스냅 샵, 퍼스널 컬러 전문 업체의 제휴를 환영합니다.</p>
              <a href="mailto:partner@viewdding.com" className="drawer-partner-btn">
                partner@viewdding.com
              </a>
            </div>

            <div className="drawer-bottom-links">
              <Link href="/favorites/">보관함 바로가기</Link>
              <span>·</span>
              <Link href="/methodology/">신뢰도 가이드</Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
