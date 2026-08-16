"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CheckSquareOffset,
  ListChecks,
  Info,
  Sparkle,
} from "@phosphor-icons/react";
import { CurationCard } from "@/components/CurationCard";
import {
  ESSENTIAL_STAGES,
  ESSENTIAL_CATEGORIES,
  type WeddingEssentialItem,
} from "@/domain/essentials-types";
import {
  FAVORITES_EVENT,
  readCategoryFavorites,
  toggleFavorite,
} from "@/lib/favorites";

interface EssentialsExperienceProps {
  initialItems: WeddingEssentialItem[];
}

export function EssentialsExperience({ initialItems }: EssentialsExperienceProps) {
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isChecklistMode, setIsChecklistMode] = useState<boolean>(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const syncSaved = () => {
      setSavedIds(new Set(readCategoryFavorites("essentials")));
    };
    syncSaved();
    window.addEventListener(FAVORITES_EVENT, syncSaved);
    window.addEventListener("storage", syncSaved);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, syncSaved);
      window.removeEventListener("storage", syncSaved);
    };
  }, []);

  const handleToggleSave = (id: string) => {
    toggleFavorite("essentials", id);
  };

  // LocalStorage checklist synchronization
  useEffect(() => {
    try {
      const stored = localStorage.getItem("viewdding_essentials_checked");
      if (stored) {
        setCheckedIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleToggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem("viewdding_essentials_checked", JSON.stringify(Array.from(next)));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Filter items by stage and category
  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      const matchStage =
        selectedStage === "all" || item.stages.includes(selectedStage);
      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchStage && matchCategory;
    });
  }, [initialItems, selectedStage, selectedCategory]);

  const checkedCount = useMemo(() => {
    return filteredItems.filter((item) => checkedIds.has(item.id)).length;
  }, [filteredItems, checkedIds]);

  const progressPercent = filteredItems.length > 0
    ? Math.round((checkedCount / filteredItems.length) * 100)
    : 0;

  const currentStageDef = ESSENTIAL_STAGES.find((s) => s.id === selectedStage);

  return (
    <div className="curation-page-shell">
      {/* Hero Section */}
      <header className="curation-hero">
        <span className="curation-hero-kicker">Wedding Essentials Archive</span>
        <h1>결혼 준비물 컬렉션</h1>
        <p>
          드레스 투어부터 스튜디오 스냅, 본식 당일과 신혼여행까지.<br />
          결혼을 완성하는 디테일한 준비물과 실전 꿀팁을 확인해 보세요.
        </p>

        {/* Slim Trust Line Notice */}
        <div className="curation-trust-line" role="note" aria-label="큐레이션 및 가격 정책">
          <Info size={13} weight="bold" className="curation-trust-icon" />
          <span>Viewdding 큐레이션은 판매처가 수수료를 부담하며, 구매 가격에는 전혀 차이가 없습니다.</span>
        </div>
      </header>

      {/* Stage Navigation (Sticky) */}
      <nav className="curation-stage-nav-wrap" aria-label="결혼 단계별 필터">
        <div className="curation-stage-nav">
          {ESSENTIAL_STAGES.map((stage) => {
            const isActive = selectedStage === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                className={`curation-stage-tab ${isActive ? "is-active" : ""}`}
                onClick={() => setSelectedStage(stage.id)}
              >
                <span>{stage.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sub Filter & Checklist Bar */}
      <div className="curation-sub-filter-row">
        {/* Category Filter Chips */}
        <div className="curation-chips-group" aria-label="품목별 카테고리 필터">
          {ESSENTIAL_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`curation-chip ${isActive ? "is-active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Checklist Mode Button */}
        <button
          type="button"
          className={`checklist-btn ${isChecklistMode ? "is-active" : ""}`}
          onClick={() => setIsChecklistMode(!isChecklistMode)}
        >
          {isChecklistMode ? <CheckSquareOffset size={16} weight="bold" /> : <ListChecks size={16} weight="bold" />}
          <span>{isChecklistMode ? "체크리스트 모드 켜짐" : "체크리스트 모드"}</span>
        </button>
      </div>

      {/* Checklist Progress Bar (when mode is active) */}
      {isChecklistMode && (
        <div className="checklist-toggle-bar">
          <div className="checklist-info">
            <span className="checklist-title">
              {currentStageDef?.label} 준비 진행률: {checkedCount} / {filteredItems.length}개 완료 ({progressPercent}%)
            </span>
            <div className="checklist-progress-bar-wrap">
              <div
                className="checklist-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
            체크된 아이템은 브라우저에 자동 저장돼요
          </span>
        </div>
      )}

      {/* Inpock 2-Column (Mobile) / 4-Column (Desktop) Collection Grid */}
      {filteredItems.length === 0 ? (
        <div className="empty-state" style={{ margin: "40px 0" }}>
          <h3>선택한 조건에 해당하는 준비물이 없습니다.</h3>
          <p>다른 단계나 카테고리를 선택해 보세요.</p>
        </div>
      ) : (
        <section className="inpock-grid" aria-label="준비물 큐레이션 목록">
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
              tags={item.tags}
              isAffiliate={item.isAffiliate}
              isMustHave={item.isMustHave}
              showCheckbox={isChecklistMode}
              isChecked={checkedIds.has(item.id)}
              onToggleCheck={handleToggleCheck}
              isSaved={savedIds.has(item.id)}
              onToggleSave={() => handleToggleSave(item.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
