"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkle, Trophy, Heart, MapPin, Calendar, MapTrifold } from "@phosphor-icons/react";
import type { HallRecord, Sido } from "@/domain/types";
import { halls } from "@/lib/data";
import { shortSidoLabel } from "@/domain/regions";
import { HallCard } from "./HallCard";

const CURATION_THEMES = [
  { id: "bright", title: "서울 밝은홀 모음", subtitle: "화사한 채광과 야외 감성 예식장", filterTag: "bright", sido: "서울특별시", seoPath: "/seoul/wedding-halls/bright/", excel: true },
  { id: "hotel", title: "프리미엄 호텔 웨딩", subtitle: "격식 있는 단독홀과 최고급 코스", filterTag: "hotel", sido: "서울특별시", seoPath: "/seoul/wedding-halls/hotel/", excel: true },
  { id: "chapel", title: "성스러운 채플 웨딩홀", subtitle: "클래식한 인테리어와 웅장한 층고", filterTag: "chapel", sido: "서울특별시", seoPath: "/seoul/wedding-halls/chapel/", excel: true },
  { id: "gyeonggi", title: "경기 인기 예식장", subtitle: "수원·용인·고양 메인 베뉴 모음", filterTag: "all", sido: "경기도", seoPath: "/gyeonggi/wedding-halls/", excel: false },
];

const RANKING_SIDOS: Array<{ sido: Sido; label: string }> = [
  { sido: "서울특별시", label: "서울" },
  { sido: "경기도", label: "경기" },
  { sido: "인천광역시", label: "인천" },
  { sido: "부산광역시", label: "부산" },
];

function RankingThumb({ hall }: { hall: HallRecord }) {
  const [failed, setFailed] = useState(false);
  const photo = hall.photos?.[0];

  if (!photo || failed) {
    return <div className="ranking-thumb-placeholder">VD</div>;
  }

  return (
    <img
      src={photo.url}
      alt={hall.venueName}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export function HallCurationTab({
  onSelectSearchTag,
}: {
  onSelectSearchTag?: (sido?: Sido, tag?: string) => void;
}) {
  const [activeRankingSido, setActiveRankingSido] = useState<Sido>("서울특별시");
  const [activeThemeId, setActiveThemeId] = useState<string>("bright");

  const rankedHalls = useMemo(() => {
    return halls
      .filter((h) => h.sido === activeRankingSido)
      .sort((a, b) => {
        const photosA = a.photos?.length || 0;
        const photosB = b.photos?.length || 0;
        if (photosB !== photosA) return photosB - photosA;
        const completenessA = (a.guarantee?.raw ? 1 : 0) + (a.seated?.raw ? 1 : 0) + (a.interval?.raw ? 1 : 0);
        const completenessB = (b.guarantee?.raw ? 1 : 0) + (b.seated?.raw ? 1 : 0) + (b.interval?.raw ? 1 : 0);
        return completenessB - completenessA;
      })
      .slice(0, 5);
  }, [activeRankingSido]);

  const activeThemeHalls = useMemo(() => {
    const theme = CURATION_THEMES.find((t) => t.id === activeThemeId);
    if (!theme) return halls.slice(0, 4);

    return halls.filter((hall) => {
      if (theme.sido && hall.sido !== theme.sido) return false;
      if (theme.filterTag === "bright") return hall.lighting === "bright" || hall.lighting === "transitional";
      if (theme.filterTag === "hotel") return hall.venueType === "hotel";
      if (theme.filterTag === "chapel") return hall.chapel === true;
      return true;
    }).slice(0, 4);
  }, [activeThemeId]);

  const activeTheme = useMemo(() => {
    return CURATION_THEMES.find((t) => t.id === activeThemeId);
  }, [activeThemeId]);

  return (
    <div className="hall-curation-container">
      {/* Featured Banner / Event Section */}
      <section className="curation-banner-section">
        <div className="curation-hero-card">
          <div className="hero-card-tag">단독 특전 큐레이션</div>
          <h2>주말 동안 검증된 추천 웨딩홀 혜택</h2>
          <p>지역과 홀 스타일별로 한눈에 비교하는 큐레이션 컬렉션</p>
          <div className="hero-card-highlights">
            <span>더리버사이드호텔</span> · <span>서울웨딩타워</span> · <span>하우스오브더라움</span> · <span>빌라드지디</span>
          </div>
        </div>
      </section>

      {/* Theme Collection Selection */}
      <section className="curation-section">
        <div className="curation-section-header">
          <div className="curation-title-group">
            <Sparkle size={20} className="title-icon" />
            <h3>테마별 추천 웨딩홀</h3>
          </div>
          <span className="curation-subtitle">취향에 맞는 테마를 골라보세요</span>
        </div>

        <div className="curation-theme-tabs">
          {CURATION_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`curation-theme-btn${activeThemeId === theme.id ? " is-active" : ""}`}
              onClick={() => setActiveThemeId(theme.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <strong>{theme.title}</strong>
                {theme.excel ? <span className="excel-badge">Excel</span> : null}
              </div>
              <small>{theme.subtitle}</small>
            </button>
          ))}
        </div>

        {activeTheme ? (
          <div className="curation-theme-meta-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "#666" }}>
              {activeTheme.excel ? "✅ 이 테마는 전체 리스트 엑셀 다운로드가 가능합니다." : "전체 리스트 비교 페이지"}
            </span>
            <Link
              href={activeTheme.seoPath}
              className="curation-view-all-link"
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#57524C",
                textDecoration: "underline",
              }}
            >
              전체보기 & 엑셀 다운로드 ➔
            </Link>
          </div>
        ) : null}

        <div className="result-list">
          {activeThemeHalls.map((hall) => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
      </section>

      {/* Hall Rankings Section - Updated Title to '지역별 추천 베스트 홀' */}
      <section className="curation-section ranking-section">
        <div className="curation-section-header">
          <div className="curation-title-group">
            <Trophy size={20} className="title-icon trophy" />
            <h3>지역별 추천 베스트 홀</h3>
          </div>
          <span className="ranking-timestamp">26. 08. 15 기준</span>
        </div>

        {/* Region Tabs for Ranking */}
        <div className="ranking-sido-tabs">
          {RANKING_SIDOS.map((item) => (
            <button
              key={item.sido}
              type="button"
              className={`ranking-sido-btn${activeRankingSido === item.sido ? " is-active" : ""}`}
              onClick={() => setActiveRankingSido(item.sido)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Ranking Hall List */}
        <div className="ranking-list">
          {rankedHalls.map((hall, idx) => (
            <Link key={hall.id} href={`/halls/${hall.id}/`} className="ranking-item">
              <span className="ranking-number">{idx + 1}</span>
              <div className="ranking-thumb-wrapper">
                <RankingThumb hall={hall} />
              </div>
              <div className="ranking-info">
                <div className="ranking-meta">
                  <span className="ranking-badge">BEST</span>
                  <span>{shortSidoLabel(hall.sido)} {hall.sigungu || hall.district}</span>
                </div>
                <strong className="ranking-venue-name">{hall.venueName}</strong>
                {hall.hallName && hall.hallName !== hall.venueName ? (
                  <span className="ranking-hall-name">{hall.hallName}</span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
