"use client";

import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, SlidersHorizontal, MapPin, Sparkle, CaretLeft, MapTrifold, List } from "@phosphor-icons/react";
import { EMPTY_FILTERS, filterHalls } from "@/domain/filter";
import { groupFilteredHallsByVenue } from "@/domain/hall-map";
import { REGION_DEFINITIONS, shortSidoLabel, SIDO_OPTIONS } from "@/domain/regions";
import type { CeremonyFormat, FilterState, HallTypeFilter, MealType, Sido } from "@/domain/types";
import { halls } from "@/lib/data";
import { hallTypeLabel } from "@/lib/labels";
import { HallCard } from "./HallCard";
import { KakaoHallMap } from "./KakaoHallMap";
import { RegionPickerModal } from "./RegionPickerModal";
import { FilterSheetModal } from "./FilterSheetModal";
import { HallCurationTab } from "./HallCurationTab";

const PAGE_SIZE = 24;
const REGION_BY_CODE = new Map(REGION_DEFINITIONS.map((region) => [region.regionCode, region]));
type MainTab = "curation" | "list";
type ViewMode = "list" | "map";

function queryFromFilters(filters: FilterState, mainTab: MainTab, viewMode: ViewMode): string {
  const params = new URLSearchParams();
  if (mainTab === "curation") params.set("tab", "curation");
  if (viewMode === "map") params.set("view", "map");
  if (filters.keyword) params.set("q", filters.keyword);
  filters.sidos.forEach((sido) => params.append("sido", sido));
  filters.regionCodes.forEach((regionCode) => params.append("region", regionCode));
  if (filters.hallTypes.length) params.set("types", filters.hallTypes.join(","));
  if (filters.guests !== null) params.set("guests", String(filters.guests));
  if (filters.naturalLight) params.set("natural", "1");
  if (filters.ceremonyFormats.length) params.set("ceremony", filters.ceremonyFormats.join(","));
  if (filters.intervalAtLeast !== null) params.set("interval", String(filters.intervalAtLeast));
  if (filters.meals.length) params.set("meals", filters.meals.join(","));
  return params.toString();
}

function filterSelectionCount(filters: FilterState): number {
  return (filters.keyword ? 1 : 0) + filters.sidos.length + filters.regionCodes.length + filters.hallTypes.length + Number(filters.guests !== null)
    + Number(filters.naturalLight) + filters.ceremonyFormats.length + Number(filters.intervalAtLeast !== null)
    + filters.meals.length;
}

function regionLabel(regionCode: string): string {
  const region = REGION_BY_CODE.get(regionCode);
  return region ? `${shortSidoLabel(region.sido)} ${region.sigungu}` : regionCode;
}

function locationSummary(filters: FilterState): string {
  const labels = [
    ...filters.sidos.map((sido) => `${shortSidoLabel(sido)} 전체`),
    ...filters.regionCodes.map(regionLabel),
  ];
  if (labels.length === 0) return "지역";
  if (labels.length === 1) return labels[0];
  return `${labels[0]} 외 ${labels.length - 1}`;
}

function typeSummary(types: HallTypeFilter[]): string {
  if (types.length === 0) return "홀 타입";
  if (types.length <= 2) return types.map(hallTypeLabel).join(" · ");
  return `${hallTypeLabel(types[0])} 외 ${types.length - 1}`;
}

export function SearchExperience({
  compact = false,
  kakaoMapAppKey = "",
}: {
  compact?: boolean;
  kakaoMapAppKey?: string;
}) {
  const [mainTab, setMainTab] = useState<MainTab>("curation");
  const [draft, setDraft] = useState<FilterState>({ ...EMPTY_FILTERS });
  const [applied, setApplied] = useState<FilterState>({ ...EMPTY_FILTERS });
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const hasFilters = Boolean(
      params.get("q") || params.get("sido") || params.get("region") ||
      params.get("types") || params.get("guests") || params.get("natural") ||
      params.get("ceremony") || params.get("interval") || params.get("meals")
    );
    const requestedTab: MainTab = tabParam === "list" ? "list" : tabParam === "curation" ? "curation" : (hasFilters ? "list" : "curation");
    const requestedSidos = Array.from(new Set(
      params.getAll("sido").flatMap((value) => value.split(","))
        .filter((value): value is Sido => SIDO_OPTIONS.some((option) => option.value === value)),
    ));
    const requestedRegionCodes = params.getAll("region").flatMap((value) => value.split(","))
      .filter((regionCode) => REGION_BY_CODE.has(regionCode));

    const parsed: FilterState = {
      keyword: params.get("q") ?? "",
      sidos: requestedSidos,
      regionCodes: requestedRegionCodes,
      hallTypes: (params.get("types")?.split(",").filter(Boolean) ?? []) as HallTypeFilter[],
      guests: params.get("guests") ? Number(params.get("guests")) : null,
      naturalLight: params.get("natural") === "1",
      ceremonyFormats: (params.get("ceremony")?.split(",").filter(Boolean) ?? []) as Exclude<CeremonyFormat, "unknown">[],
      intervalAtLeast: params.get("interval") ? Number(params.get("interval")) : null,
      meals: (params.get("meals")?.split(",").filter(Boolean) ?? []) as Exclude<MealType, "no_meal" | "other">[],
    };

    setDraft(parsed);
    setApplied(parsed);
    setMainTab(requestedTab);
    setViewMode(params.get("view") === "map" ? "map" : "list");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("hall-mobile-map-active", viewMode === "map");
    return () => document.body.classList.remove("hall-mobile-map-active");
  }, [viewMode]);

  const results = useMemo(() => filterHalls(halls, applied), [applied]);
  const draftResults = useMemo(() => filterHalls(halls, draft), [draft]);
  const mapVenues = useMemo(
    () => groupFilteredHallsByVenue([...results.matched, ...results.unknown]),
    [results],
  );

  useEffect(() => setVisible(PAGE_SIZE), [applied]);

  function commit(next: FilterState) {
    setApplied(next);
    setDraft(next);
    const query = queryFromFilters(next, mainTab, viewMode);
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  function switchMainTab(nextTab: MainTab) {
    setMainTab(nextTab);
    if (nextTab === "list") {
      setViewMode("list");
    }
    const query = queryFromFilters(applied, nextTab, viewMode);
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  function toggleViewMode() {
    const nextViewMode = viewMode === "list" ? "map" : "list";
    setViewMode(nextViewMode);
    const query = queryFromFilters(applied, mainTab, nextViewMode);
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  const chips: Array<{ key: string; label: string; remove: () => void }> = [];
  if (applied.keyword) {
    chips.push({
      key: "keyword",
      label: `검색: ${applied.keyword}`,
      remove: () => commit({ ...applied, keyword: "" }),
    });
  }
  applied.sidos.forEach((sido) => chips.push({
    key: `sido-${sido}`,
    label: `${shortSidoLabel(sido)} 전체`,
    remove: () => commit({ ...applied, sidos: applied.sidos.filter((item) => item !== sido) }),
  }));
  applied.regionCodes.forEach((regionCode) => chips.push({
    key: `region-${regionCode}`,
    label: regionLabel(regionCode),
    remove: () => commit({ ...applied, regionCodes: applied.regionCodes.filter((item) => item !== regionCode) }),
  }));
  applied.hallTypes.forEach((type) => chips.push({
    key: `type-${type}`,
    label: hallTypeLabel(type),
    remove: () => commit({ ...applied, hallTypes: applied.hallTypes.filter((item) => item !== type) }),
  }));
  if (applied.guests !== null) chips.push({ key: "guests", label: `${applied.guests}명`, remove: () => commit({ ...applied, guests: null }) });
  if (applied.naturalLight) chips.push({ key: "natural", label: "자연광 있음", remove: () => commit({ ...applied, naturalLight: false }) });

function detailFilterCount(filters: FilterState): number {
  return Number(filters.guests !== null) + Number(filters.naturalLight) + filters.ceremonyFormats.length + Number(filters.intervalAtLeast !== null) + filters.meals.length;
}

  const [filterModalMode, setFilterModalMode] = useState<"all" | "hallType" | "detail">("all");

  const appliedCount = filterSelectionCount(applied);
  const detailCount = detailFilterCount(applied);
  const total = results.matched.length + results.unknown.length;

  const handleRegionApply = (newSidos: Sido[], newRegionCodes: string[]) => {
    const next = { ...draft, sidos: newSidos, regionCodes: newRegionCodes };
    commit(next);
  };

  const handleFilterSheetApply = (nextState: FilterState) => {
    commit(nextState);
  };

  return (
    <section className={`search-experience${compact ? " is-compact" : ""}${viewMode === "map" ? " is-map-mode" : ""}`}>
      {/* Top Main Navigation Tabs (Matching Screenshot 2) */}
      <nav className="main-nav-tabs" role="tablist" aria-label="웨딩홀 메뉴">
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === "curation"}
          className={`main-tab-btn${mainTab === "curation" ? " is-active" : ""}`}
          onClick={() => switchMainTab("curation")}
        >
          큐레이션
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === "list"}
          className={`main-tab-btn${mainTab === "list" ? " is-active" : ""}`}
          onClick={() => switchMainTab("list")}
        >
          전체보기
        </button>
      </nav>

      {/* Main Tab 1: Curation */}
      {mainTab === "curation" ? (
        <HallCurationTab />
      ) : (
        /* Main Tab 2: Full List / Search */
        <>
          {/* Top Keyword Search Input Bar */}
          <div className="search-top-bar">
            <div className="search-input-wrapper">
              <CaretLeft size={18} className="search-back-icon" />
              <input
                type="text"
                className="search-keyword-input"
                placeholder="웨딩홀을 검색해 보세요."
                value={draft.keyword}
                onChange={(e) => setDraft((prev) => ({ ...prev, keyword: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commit(draft);
                  }
                }}
              />
              {draft.keyword ? (
                <button
                  type="button"
                  className="search-input-clear-btn"
                  onClick={() => {
                    const next = { ...draft, keyword: "" };
                    commit(next);
                  }}
                  aria-label="검색어 지우기"
                >
                  ×
                </button>
              ) : (
                <MagnifyingGlass size={18} className="search-input-icon" />
              )}
            </div>

            {/* Compact Filter Pills Bar */}
            <div className="filter-pills-bar">
              <button
                type="button"
                className={`filter-pill-chip${appliedCount > 0 ? " has-active" : ""}`}
                onClick={() => {
                  setFilterModalMode("all");
                  setFilterSheetOpen(true);
                }}
                aria-label="전체 필터"
              >
                <SlidersHorizontal size={15} />
              </button>

              <button
                type="button"
                className={`filter-pill-chip${draft.sidos.length > 0 || draft.regionCodes.length > 0 ? " is-selected" : ""}`}
                onClick={() => setRegionModalOpen(true)}
              >
                <MapPin size={14} />
                <span>{locationSummary(draft)}</span>
                <span className="pill-arrow">∨</span>
              </button>

              <button
                type="button"
                className={`filter-pill-chip${draft.hallTypes.length > 0 ? " is-selected" : ""}`}
                onClick={() => {
                  setFilterModalMode("hallType");
                  setFilterSheetOpen(true);
                }}
              >
                <Sparkle size={14} />
                <span>{typeSummary(draft.hallTypes)}</span>
                <span className="pill-arrow">∨</span>
              </button>

              <button
                type="button"
                className={`filter-pill-chip${detailCount > 0 ? " is-selected" : ""}`}
                onClick={() => {
                  setFilterModalMode("detail");
                  setFilterSheetOpen(true);
                }}
              >
                <span>상세필터{detailCount ? ` ${detailCount}` : ""}</span>
                <span className="pill-arrow">∨</span>
              </button>
            </div>
          </div>

          <div id="search-results" className="results-heading">
            {chips.length > 0 ? (
              <div className="applied-chips">
                {chips.map((chip) => (
                  <button key={chip.key} type="button" aria-label={`${chip.label} 필터 해제`} onClick={chip.remove}>
                    {chip.label}
                    <span className="filter-chip-remove" aria-hidden="true">해제</span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="result-heading-row">
              <div className="result-summary" aria-live="polite">
                <strong>총 {results.matched.length}개</strong>
                <span>정보 미확인 {results.unknown.length}개 · 총 {total}개 홀</span>
              </div>
            </div>
          </div>

          {viewMode === "map" ? (
            <KakaoHallMap venues={mapVenues} appKey={kakaoMapAppKey} />
          ) : (
            <>
              <div className="result-list">
                {results.matched.slice(0, visible).map((item) => (
                  <HallCard key={item.hall.id} hall={item.hall} />
                ))}
              </div>
              {visible < results.matched.length ? (
                <button type="button" className="more-button" onClick={() => setVisible(visible + PAGE_SIZE)}>
                  홀 더 보기
                </button>
              ) : null}
              {results.matched.length === 0 ? (
                <div className="empty-state">
                  <h3>조건이 확인된 홀이 없어요.</h3>
                  <p>검색어를 확인하거나 필터 조건을 조정해보세요.</p>
                </div>
              ) : null}
              {results.unknown.length > 0 ? (
                <details className="unknown-results">
                  <summary>정보 확인이 필요한 홀 {results.unknown.length}개 보기</summary>
                  <p>선택한 조건과 명확히 다르지는 않지만 일부 값이 공개되지 않은 홀입니다.</p>
                  <div className="result-list">
                    {results.unknown.slice(0, 24).map((item) => (
                      <HallCard key={item.hall.id} hall={item.hall} unknownReasons={item.unknownReasons} />
                    ))}
                  </div>
                </details>
              ) : null}
            </>
          )}

          {/* Floating Bottom-Right Map Toggle Button (Matching Screenshot 4 & 5) */}
          <button
            type="button"
            className="floating-map-toggle-btn"
            onClick={toggleViewMode}
            aria-label={viewMode === "list" ? "지도 보기" : "목록 보기"}
          >
            {viewMode === "list" ? (
              <>
                <MapTrifold size={16} weight="bold" />
                <span>지도</span>
              </>
            ) : (
              <>
                <List size={16} weight="bold" />
                <span>목록</span>
              </>
            )}
          </button>
        </>
      )}

      {/* Region Picker Modal */}
      <RegionPickerModal
        isOpen={regionModalOpen}
        onClose={() => setRegionModalOpen(false)}
        selectedSidos={draft.sidos}
        selectedRegionCodes={draft.regionCodes}
        onApply={handleRegionApply}
        title="웨딩홀 지역 선택"
      />

      {/* Category Filter Sheet Modal */}
      <FilterSheetModal
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={draft}
        onApply={handleFilterSheetApply}
        totalMatchesCount={draftResults.matched.length}
        mode={filterModalMode}
      />
    </section>
  );
}
