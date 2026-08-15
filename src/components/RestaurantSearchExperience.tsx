"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { X, MagnifyingGlass, SlidersHorizontal, MapPin, ForkKnife, MapTrifold, List } from "@phosphor-icons/react";
import { EMPTY_RESTAURANT_FILTERS, filterRestaurants } from "@/domain/restaurant-filter";
import { isRestaurantCuisineCategory, RESTAURANT_CUISINE_CATEGORIES } from "@/domain/restaurant-cuisine";
import type { RestaurantCuisineCategory } from "@/domain/restaurant-cuisine";
import type { GatheringPurpose, RestaurantFilterState, RestaurantRecord, Weekday } from "@/domain/restaurant-types";
import type { Sido } from "@/domain/types";
import { shortSidoLabel } from "@/domain/regions";
import { KakaoRestaurantMap } from "./KakaoRestaurantMap";
import { RestaurantCard } from "./RestaurantCard";
import { RegionPickerModal } from "./RegionPickerModal";
import { RestaurantFilterSheetModal } from "./RestaurantFilterSheetModal";
import type { RestaurantFilterMode } from "./RestaurantFilterSheetModal";

const WEEKDAYS: Array<{ value: Weekday; label: string }> = [
  { value: "mon", label: "월요일" }, { value: "tue", label: "화요일" },
  { value: "wed", label: "수요일" }, { value: "thu", label: "목요일" },
  { value: "fri", label: "금요일" }, { value: "sat", label: "토요일" },
  { value: "sun", label: "일요일" },
];
const PAGE_SIZE = 20;
type ViewMode = "list" | "map";

interface AppliedFilterChip {
  key: string;
  label: string;
}

function purposeFrom(value: string | null): GatheringPurpose {
  return value === "family_meeting" ? "family_meeting" : "invitation";
}

function queryFromFilters(filters: RestaurantFilterState, viewMode: ViewMode): string {
  const params = new URLSearchParams();
  params.set("purpose", filters.purpose);
  if (viewMode === "map") params.set("view", "map");
  if (filters.keyword) params.set("q", filters.keyword);
  if (filters.district) params.set("district", filters.district);
  if (filters.area) params.set("area", filters.area);
  if (filters.weekday) params.set("weekday", filters.weekday);
  if (filters.cuisines.length > 0) params.set("cuisines", filters.cuisines.join(","));
  if (filters.budgetMax !== null) params.set("budget", String(filters.budgetMax));
  if (filters.privateRoomOnly && filters.partySize !== null) params.set("people", String(filters.partySize));
  if (filters.courseOnly) params.set("course", "1");
  if (filters.privateRoomOnly) params.set("room", "1");
  if (filters.parkingOnly) params.set("parking", "1");
  return params.toString();
}

function cuisineCategoriesFrom(value: string | null): RestaurantCuisineCategory[] {
  return value?.split(",").filter(isRestaurantCuisineCategory) ?? [];
}

function filterSelectionCount(filters: RestaurantFilterState): number {
  return Number(Boolean(filters.keyword.trim())) + Number(filters.weekday !== null) + filters.cuisines.length + Number(filters.budgetMax !== null)
    + Number(filters.privateRoomOnly && filters.partySize !== null) + Number(filters.courseOnly) + Number(filters.privateRoomOnly)
    + Number(filters.parkingOnly) + Number(Boolean(filters.district)) + Number(Boolean(filters.area));
}

function appliedFilterChips(filters: RestaurantFilterState): AppliedFilterChip[] {
  const chips: AppliedFilterChip[] = [];
  if (filters.keyword.trim()) chips.push({ key: "keyword", label: `"${filters.keyword}"` });
  if (filters.district) chips.push({ key: "district", label: filters.district });
  if (filters.area) chips.push({ key: "area", label: filters.area });
  if (filters.weekday) chips.push({
    key: "weekday",
    label: WEEKDAYS.find((weekday) => weekday.value === filters.weekday)?.label ?? "방문 요일",
  });
  for (const cuisine of filters.cuisines) chips.push({ key: `cuisine:${cuisine}`, label: cuisine });
  if (filters.budgetMax !== null) chips.push({ key: "budget", label: `최대 ${(filters.budgetMax / 10000).toLocaleString("ko-KR")}만원` });
  if (filters.privateRoomOnly && filters.partySize !== null) chips.push({ key: "people", label: `룸 ${filters.partySize}명` });
  if (filters.courseOnly) chips.push({ key: "course", label: "코스 가능" });
  if (filters.privateRoomOnly) chips.push({ key: "room", label: "룸 있음" });
  if (filters.parkingOnly) chips.push({ key: "parking", label: "주차 가능" });
  return chips;
}

export function RestaurantSearchExperience({
  restaurants,
  kakaoMapAppKey,
}: {
  restaurants: RestaurantRecord[];
  kakaoMapAppKey: string;
}) {
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<RestaurantFilterState>({ ...EMPTY_RESTAURANT_FILTERS });
  const [applied, setApplied] = useState<RestaurantFilterState>({ ...EMPTY_RESTAURANT_FILTERS });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filterModalMode, setFilterModalMode] = useState<RestaurantFilterMode>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [selectedSidos, setSelectedSidos] = useState<Sido[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  useEffect(() => {
    const privateRoomOnly = searchParams.get("room") === "1";
    const initialDistrict = searchParams.get("district") ?? "";

    const parsed: RestaurantFilterState = {
      keyword: searchParams.get("q") ?? "",
      purpose: purposeFrom(searchParams.get("purpose")),
      district: initialDistrict,
      area: searchParams.get("area") ?? "",
      weekday: (searchParams.get("weekday") || null) as Weekday | null,
      cuisines: cuisineCategoriesFrom(searchParams.get("cuisines")),
      budgetMax: searchParams.get("budget") ? Number(searchParams.get("budget")) : null,
      partySize: searchParams.get("people") ? Number(searchParams.get("people")) : null,
      courseOnly: searchParams.get("course") === "1",
      privateRoomOnly,
      parkingOnly: searchParams.get("parking") === "1",
    };

    if (searchParams.get("view") === "map") setViewMode("map");
    setDraft(parsed);
    setApplied(parsed);
    if (initialDistrict) {
      setSelectedDistricts([initialDistrict]);
    }
  }, [searchParams]);

function detailFilterCount(filters: RestaurantFilterState): number {
  return Number(filters.weekday !== null) + Number(filters.budgetMax !== null) + Number(filters.privateRoomOnly) + Number(filters.courseOnly) + Number(filters.parkingOnly);
}

  const results = useMemo(() => filterRestaurants(restaurants, applied), [restaurants, applied]);
  const draftResults = useMemo(() => filterRestaurants(restaurants, draft), [restaurants, draft]);

  const mapRestaurants = useMemo(
    () => [...results.matched, ...results.unknown].map((item) => item.restaurant),
    [results],
  );
  const activeFilterChips = useMemo(() => appliedFilterChips(applied), [applied]);
  const appliedCount = filterSelectionCount(applied);
  const detailCount = detailFilterCount(applied);
  const total = results.matched.length + results.unknown.length;

  function commit(next: RestaurantFilterState) {
    setApplied(next);
    setDraft(next);
    setVisibleCount(PAGE_SIZE);
    const query = queryFromFilters(next, viewMode);
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  function toggleViewMode() {
    const nextViewMode = viewMode === "list" ? "map" : "list";
    setViewMode(nextViewMode);
    const query = queryFromFilters(applied, nextViewMode);
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  function clearAppliedFilter(key: string) {
    const next = { ...applied, cuisines: [...applied.cuisines] };
    if (key === "keyword") next.keyword = "";
    else if (key === "district") {
      next.district = "";
      setSelectedSidos([]);
      setSelectedDistricts([]);
    } else if (key === "area") next.area = "";
    else if (key === "weekday") next.weekday = null;
    else if (key.startsWith("cuisine:")) {
      const target = key.replace("cuisine:", "");
      next.cuisines = next.cuisines.filter((c) => c !== target);
    } else if (key === "budget") next.budgetMax = null;
    else if (key === "people") next.partySize = null;
    else if (key === "course") next.courseOnly = false;
    else if (key === "room") {
      next.privateRoomOnly = false;
      next.partySize = null;
    } else if (key === "parking") next.parkingOnly = false;

    commit(next);
  }

  const regionSummaryText = useMemo(() => {
    if (draft.district) return draft.district;
    if (selectedDistricts.length > 0) return selectedDistricts[0];
    if (selectedSidos.length > 0) return `${shortSidoLabel(selectedSidos[0])} 전체`;
    return "지역";
  }, [draft.district, selectedDistricts, selectedSidos]);

  const handleRegionApply = (sidos: Sido[], codes: string[], districts: string[]) => {
    setSelectedSidos(sidos);
    setSelectedDistricts(districts);
    const chosenDistrict = districts[0] || (sidos.length > 0 ? `${shortSidoLabel(sidos[0])}` : "");
    const nextDraft = { ...draft, district: chosenDistrict, area: "" };
    commit(nextDraft);
  };

  const handleFilterSheetApply = (nextState: RestaurantFilterState) => {
    commit(nextState);
  };

  return (
    <section className={`restaurant-search-experience${viewMode === "map" ? " is-map-mode" : ""}`}>
      <div className="search-top-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-keyword-input"
            placeholder={draft.purpose === "invitation" ? "청첩장 모임 장소를 검색해 보세요." : "상견례 장소를 검색해 보세요."}
            value={draft.keyword}
            onChange={(e) => {
              const next = { ...draft, keyword: e.target.value };
              setDraft(next);
              commit(next);
            }}
          />
          {draft.keyword ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                const next = { ...draft, keyword: "" };
                setDraft(next);
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
            className={`filter-pill-chip${draft.district || selectedSidos.length > 0 ? " is-selected" : ""}`}
            onClick={() => setRegionModalOpen(true)}
          >
            <MapPin size={14} />
            <span>{regionSummaryText}</span>
            <span className="pill-arrow">∨</span>
          </button>

          <button
            type="button"
            className={`filter-pill-chip${draft.cuisines.length > 0 ? " is-selected" : ""}`}
            onClick={() => {
              setFilterModalMode("cuisine");
              setFilterSheetOpen(true);
            }}
          >
            <ForkKnife size={14} />
            <span>{draft.cuisines.length > 0 ? draft.cuisines.join(", ") : "음식 종류"}</span>
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

      <div id="restaurant-results" className="results-heading">
        {activeFilterChips.length > 0 ? (
          <div className="applied-chips">
            {activeFilterChips.map((chip) => (
              <button key={chip.key} type="button" aria-label={`${chip.label} 필터 해제`} onClick={() => clearAppliedFilter(chip.key)}>
                {chip.label}
                <span className="filter-chip-remove" aria-hidden="true">✕</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="result-heading-row">
          <div className="result-summary" aria-live="polite">
            <strong>총 {results.matched.length}개</strong>
            <span>정보 미확인 {results.unknown.length}개 · 총 {total}개 장소</span>
          </div>
        </div>
      </div>

      {viewMode === "map" ? (
        <KakaoRestaurantMap
          restaurants={mapRestaurants}
          appKey={kakaoMapAppKey}
        />
      ) : (
        <>
          <div className="restaurant-result-list">
            {results.matched.slice(0, visibleCount).map((item) => (
              <RestaurantCard key={item.restaurant.id} restaurant={item.restaurant} />
            ))}
          </div>

          {results.matched.length > visibleCount ? (
            <div className="restaurant-load-more-row">
              <button
                type="button"
                className="restaurant-load-more-btn"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                더 많은 {draft.purpose === "invitation" ? "청첩장 모임" : "상견례"} 장소 보기 (+{Math.min(PAGE_SIZE, results.matched.length - visibleCount)}곳)
              </button>
            </div>
          ) : null}
        </>
      )}

      {/* Floating Bottom-Right Map Button */}
      <button
        type="button"
        className="floating-map-toggle-btn"
        onClick={toggleViewMode}
        aria-label={viewMode === "map" ? "목록으로 보기" : "지도 모드로 보기"}
      >
        {viewMode === "list" ? (
          <>
            <MapTrifold size={18} weight="fill" />
            <span>지도</span>
          </>
        ) : (
          <>
            <List size={18} weight="bold" />
            <span>목록</span>
          </>
        )}
      </button>

      {/* Region Bottom Sheet Modal */}
      <RegionPickerModal
        isOpen={regionModalOpen}
        onClose={() => setRegionModalOpen(false)}
        selectedSidos={selectedSidos}
        selectedRegionCodes={[]}
        selectedDistricts={selectedDistricts}
        onApply={handleRegionApply}
        title="모임 장소 지역 선택"
      />

      {/* Filter Bottom Sheet Modal */}
      <RestaurantFilterSheetModal
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
