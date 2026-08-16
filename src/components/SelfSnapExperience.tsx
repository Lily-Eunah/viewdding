"use client";

import { useState, useMemo } from "react";
import { Sparkle, Camera, Buildings, Tree, Info } from "@phosphor-icons/react";
import { CurationCard } from "@/components/CurationCard";
import { VenueCurationCard } from "@/components/VenueCurationCard";
import {
  SELF_SNAP_ITEM_CATEGORIES,
  SELF_SNAP_REGIONS,
  type SelfSnapItem,
  type SelfSnapVenue,
  type SelfSnapItemCategory,
  type SelfSnapRegion,
} from "@/domain/self-snap-types";

type MainTab = "items" | "studios" | "outdoor";

interface SelfSnapExperienceProps {
  initialItems: SelfSnapItem[];
  initialVenues: SelfSnapVenue[];
}

export function SelfSnapExperience({
  initialItems,
  initialVenues,
}: SelfSnapExperienceProps) {
  const [mainTab, setMainTab] = useState<MainTab>("items");
  const [selectedItemCat, setSelectedItemCat] = useState<SelfSnapItemCategory>("all");
  const [selectedRegion, setSelectedRegion] = useState<SelfSnapRegion>("all");

  // Filter items
  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      if (selectedItemCat === "all") return true;
      return item.category === selectedItemCat;
    });
  }, [initialItems, selectedItemCat]);

  // Filter venues by tab (studios / hotels vs outdoor) and region
  const filteredVenues = useMemo(() => {
    return initialVenues.filter((venue) => {
      const matchTab =
        mainTab === "studios"
          ? venue.category === "studio" || venue.category === "hotel"
          : venue.category === "outdoor";
      const matchRegion =
        selectedRegion === "all" || venue.region === selectedRegion;
      return matchTab && matchRegion;
    });
  }, [initialVenues, mainTab, selectedRegion]);

  return (
    <div className="curation-page-shell">
      {/* Hero Section */}
      <header className="curation-hero">
        <span className="curation-hero-kicker">Self Wedding &amp; Snap Archive</span>
        <h1>셀프스냅 큐레이션</h1>
        <p>
          우리만의 감성을 담은 셀프 웨딩 스냅.<br />
          감각적인 드레스·소품 쇼핑부터 자연광 스튜디오와 야외 인생샷 명소까지 한곳에서 둘러보세요.
        </p>

        {/* Slim Trust Line Notice */}
        <div className="curation-trust-line" role="note" aria-label="큐레이션 및 가격 정책">
          <Info size={13} weight="bold" className="curation-trust-icon" />
          <span>Viewdding 큐레이션은 판매처가 수수료를 부담하며, 구매 및 대관 금액에는 전혀 차이가 없습니다.</span>
        </div>
      </header>

      {/* Main 3 Tabs (Sticky) */}
      <nav className="curation-stage-nav-wrap" aria-label="셀프스냅 메인 탭">
        <div className="curation-stage-nav">
          <button
            type="button"
            className={`curation-stage-tab ${mainTab === "items" ? "is-active" : ""}`}
            onClick={() => setMainTab("items")}
          >
            <Camera size={16} weight="bold" />
            <span>의상 & 소품 큐레이션</span>
          </button>
          <button
            type="button"
            className={`curation-stage-tab ${mainTab === "studios" ? "is-active" : ""}`}
            onClick={() => setMainTab("studios")}
          >
            <Buildings size={16} weight="bold" />
            <span>렌탈 스튜디오 & 호텔</span>
          </button>
          <button
            type="button"
            className={`curation-stage-tab ${mainTab === "outdoor" ? "is-active" : ""}`}
            onClick={() => setMainTab("outdoor")}
          >
            <Tree size={16} weight="bold" />
            <span>야외 스냅 명소</span>
          </button>
        </div>
      </nav>

      {/* Sub Filter Chips */}
      <div className="curation-sub-filter-row">
        {mainTab === "items" ? (
          /* Item Category Chips */
          <div className="curation-chips-group" aria-label="소품 카테고리 필터">
            {SELF_SNAP_ITEM_CATEGORIES.map((cat) => {
              const isActive = selectedItemCat === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`curation-chip ${isActive ? "is-active" : ""}`}
                  onClick={() => setSelectedItemCat(cat.id)}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        ) : (
          /* Region Filter Chips */
          <div className="curation-chips-group" aria-label="지역 필터">
            {SELF_SNAP_REGIONS.map((reg) => {
              const isActive = selectedRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  type="button"
                  className={`curation-chip ${isActive ? "is-active" : ""}`}
                  onClick={() => setSelectedRegion(reg.id)}
                >
                  {reg.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab Content Display */}
      {mainTab === "items" ? (
        /* 1. Items Inpock Grid */
        filteredItems.length === 0 ? (
          <div className="empty-state" style={{ margin: "40px 0" }}>
            <h3>선택한 카테고리에 해당하는 소품이 없습니다.</h3>
          </div>
        ) : (
          <section className="inpock-grid" aria-label="셀프스냅 의상 및 소품 목록">
            {filteredItems.map((item) => (
              <CurationCard
                key={item.id}
                id={item.id}
                name={item.name}
                brand={item.brand}
                priceText={item.priceText}
                thumbnailUrl={item.thumbnailUrl}
                affiliateUrl={item.affiliateUrl}
                platform={item.platform}
                editorNote={item.editorNote}
                tips={item.tips}
                tags={item.moodTags}
                isAffiliate={item.isAffiliate}
                isPopular={item.isPopular}
              />
            ))}
          </section>
        )
      ) : (
        /* 2 & 3. Venues Grid */
        filteredVenues.length === 0 ? (
          <div className="empty-state" style={{ margin: "40px 0" }}>
            <h3>선택한 지역에 해당하는 장소가 없습니다.</h3>
            <p>전체 지역을 선택해 보세요.</p>
          </div>
        ) : (
          <section className="venue-grid" aria-label="셀프스냅 장소 목록">
            {filteredVenues.map((venue) => (
              <VenueCurationCard
                key={venue.id}
                id={venue.id}
                name={venue.name}
                category={venue.category}
                regionLabel={venue.regionLabel}
                address={venue.address}
                thumbnailUrl={venue.thumbnailUrl}
                features={venue.features}
                priceInfo={venue.priceInfo}
                bestTimeTip={venue.bestTimeTip}
                editorNote={venue.editorNote}
                bookingUrl={venue.bookingUrl}
                mapUrl={venue.mapUrl}
                isAffiliate={venue.isAffiliate}
              />
            ))}
          </section>
        )
      )}
    </div>
  );
}
