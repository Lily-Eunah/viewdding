"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MagnifyingGlass,
  SlidersHorizontal,
  MapPin,
  MapTrifold,
  List,
  Sparkle,
} from "@phosphor-icons/react";
import type {
  PersonalColorFilterState,
  PersonalColorRecord,
  PersonalColorServiceTag,
} from "@/domain/personal-color-types";
import { EMPTY_PERSONAL_COLOR_FILTERS, filterPersonalColors } from "@/domain/personal-color-filter";
import { isPersonalColorServiceTag, serviceTagMeta } from "@/domain/personal-color-categories";
import type { Sido } from "@/domain/types";
import { shortSidoLabel } from "@/domain/regions";
import { KakaoPersonalColorMap } from "./KakaoPersonalColorMap";
import { PersonalColorCard } from "./PersonalColorCard";
import { RegionPickerModal } from "./RegionPickerModal";
import { PersonalColorFilterSheetModal, type PersonalColorFilterMode } from "./PersonalColorFilterSheetModal";

const PAGE_SIZE = 20;
type ViewMode = "list" | "map";

interface AppliedFilterChip {
  key: string;
  label: string;
}

function queryFromFilters(filters: PersonalColorFilterState, viewMode: ViewMode): string {
  const params = new URLSearchParams();
  if (viewMode === "map") params.set("view", "map");
  if (filters.keyword) params.set("q", filters.keyword);
  if (filters.sido) params.set("sido", filters.sido);
  if (filters.district) params.set("district", filters.district);
  if (filters.serviceTags.length > 0) params.set("services", filters.serviceTags.join(","));
  if (filters.priceBudgetMax !== null) params.set("budget", String(filters.priceBudgetMax));
  return params.toString();
}

function serviceTagsFrom(value: string | null): PersonalColorServiceTag[] {
  return value?.split(",").filter(isPersonalColorServiceTag) ?? [];
}

function filterSelectionCount(filters: PersonalColorFilterState): number {
  return (
    Number(Boolean(filters.keyword.trim())) +
    Number(Boolean(filters.sido)) +
    Number(Boolean(filters.district)) +
    filters.serviceTags.length +
    Number(filters.priceBudgetMax !== null)
  );
}

function appliedFilterChips(filters: PersonalColorFilterState): AppliedFilterChip[] {
  const chips: AppliedFilterChip[] = [];
  if (filters.keyword.trim()) chips.push({ key: "keyword", label: `"${filters.keyword}"` });
  if (filters.sido && !filters.district) chips.push({ key: "sido", label: filters.sido });
  if (filters.district) chips.push({ key: "district", label: filters.district });
  for (const tag of filters.serviceTags) {
    chips.push({ key: `service:${tag}`, label: serviceTagMeta(tag).shortLabel });
  }
  if (filters.priceBudgetMax !== null) {
    chips.push({ key: "budget", label: `최대 ${(filters.priceBudgetMax / 10000).toLocaleString("ko-KR")}만원` });
  }
  return chips;
}

export function PersonalColorSearchExperience({
  vendors,
  kakaoMapAppKey,
}: {
  vendors: PersonalColorRecord[];
  kakaoMapAppKey: string;
}) {
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<PersonalColorFilterState>({ ...EMPTY_PERSONAL_COLOR_FILTERS });
  const [applied, setApplied] = useState<PersonalColorFilterState>({ ...EMPTY_PERSONAL_COLOR_FILTERS });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filterModalMode, setFilterModalMode] = useState<PersonalColorFilterMode>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [selectedSidos, setSelectedSidos] = useState<Sido[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  useEffect(() => {
    const initialSido = searchParams.get("sido") ?? "";
    const initialDistrict = searchParams.get("district") ?? "";

    const parsed: PersonalColorFilterState = {
      keyword: searchParams.get("q") ?? "",
      sido: initialSido,
      district: initialDistrict,
      serviceTags: serviceTagsFrom(searchParams.get("services")),
      priceBudgetMax: searchParams.get("budget") ? Number(searchParams.get("budget")) : null,
      gradeAOnly: false,
      includeOnHold: false,
    };

    if (searchParams.get("view") === "map") setViewMode("map");
    setDraft(parsed);
    setApplied(parsed);

    if (initialSido) setSelectedSidos([initialSido as Sido]);
    if (initialDistrict) setSelectedDistricts([initialDistrict]);
  }, [searchParams]);

  const results = useMemo(() => filterPersonalColors(vendors, applied), [vendors, applied]);
  const draftResults = useMemo(() => filterPersonalColors(vendors, draft), [vendors, draft]);

  const mapVendors = useMemo(
    () => [...results.matched, ...results.unknown].map((item) => item.vendor),
    [results]
  );
  const activeFilterChips = useMemo(() => appliedFilterChips(applied), [applied]);
  const appliedCount = filterSelectionCount(applied);
  const detailCount = Number(applied.priceBudgetMax !== null);
  const total = results.matched.length + results.unknown.length;

  function commit(next: PersonalColorFilterState) {
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

  function clearAppliedFilter(chipKey: string) {
    const next = { ...applied };
    if (chipKey === "keyword") next.keyword = "";
    else if (chipKey === "sido") {
      setSelectedSidos([]);
      next.sido = "";
    } else if (chipKey === "district") {
      setSelectedDistricts([]);
      next.district = "";
    } else if (chipKey.startsWith("service:")) {
      const tag = chipKey.replace("service:", "") as PersonalColorServiceTag;
      next.serviceTags = next.serviceTags.filter((t) => t !== tag);
    } else if (chipKey === "budget") next.priceBudgetMax = null;

    commit(next);
  }

  const regionSummaryText = useMemo(() => {
    if (draft.district) return draft.district;
    if (selectedDistricts.length > 0) return selectedDistricts[0];
    if (selectedSidos.length > 0) return `${shortSidoLabel(selectedSidos[0])} 전체`;
    return "지역";
  }, [draft.district, selectedDistricts, selectedSidos]);

  const serviceSummaryText = useMemo(() => {
    if (draft.serviceTags.length === 0) return "진단 서비스";
    return draft.serviceTags.map((t) => serviceTagMeta(t).shortLabel).join(", ");
  }, [draft.serviceTags]);

  const handleRegionApply = (sidos: Sido[], _codes: string[], districts: string[]) => {
    setSelectedSidos(sidos);
    setSelectedDistricts(districts);
    const chosenDistrict = districts[0] || (sidos.length > 0 ? `${shortSidoLabel(sidos[0])}` : "");
    const nextDraft = { ...draft, district: chosenDistrict, sido: sidos[0] ?? "" };
    commit(nextDraft);
  };

  const handleFilterSheetApply = (nextState: PersonalColorFilterState) => {
    commit(nextState);
  };

  return (
    <section className={`restaurant-search-experience${viewMode === "map" ? " is-map-mode" : ""}`}>
      {/* Top Search & Filter Bar */}
      <div className="search-top-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-keyword-input"
            placeholder="웨딩 퍼스널 컬러 업체를 검색해 보세요. (업체명, 지역명, 서비스)"
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
            className={`filter-pill-chip${draft.serviceTags.length > 0 ? " is-selected" : ""}`}
            onClick={() => {
              setFilterModalMode("service");
              setFilterSheetOpen(true);
            }}
          >
            <span>{serviceSummaryText}</span>
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

      {/* Results Header with Applied Chips & Count */}
      <div id="restaurant-results" className="results-heading">
        {activeFilterChips.length > 0 ? (
          <div className="applied-chips">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                aria-label={`${chip.label} 필터 해제`}
                onClick={() => clearAppliedFilter(chip.key)}
              >
                {chip.label}
                <span className="filter-chip-remove" aria-hidden="true">
                  ✕
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="result-heading-row">
          <div className="result-summary" aria-live="polite">
            <strong>총 {results.matched.length}개</strong>
            <span>정보 미확인 {results.unknown.length}개 · 총 {total}개 업체</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Map or List */}
      {viewMode === "map" ? (
        <KakaoPersonalColorMap vendors={mapVendors} appKey={kakaoMapAppKey} />
      ) : (
        <>
          <div className="restaurant-result-list">
            {results.matched.slice(0, visibleCount).map(({ vendor }) => (
              <PersonalColorCard key={vendor.id} vendor={vendor} />
            ))}

            {results.unknown.slice(0, Math.max(0, visibleCount - results.matched.length)).map(({ vendor, unknownReasons }) => (
              <PersonalColorCard key={vendor.id} vendor={vendor} unknownReasons={unknownReasons} />
            ))}
          </div>

          {total === 0 ? (
            <div className="empty-state" style={{ marginTop: "40px" }}>
              <h2>선택한 조건에 맞는 업체가 없습니다.</h2>
              <p>지역이나 진단 서비스 필터를 변경해 보세요.</p>
              <button
                type="button"
                className="primary-link"
                style={{ marginTop: "16px", cursor: "pointer", border: "none" }}
                onClick={() => {
                  setSelectedSidos([]);
                  setSelectedDistricts([]);
                  commit({ ...EMPTY_PERSONAL_COLOR_FILTERS });
                }}
              >
                필터 초기화
              </button>
            </div>
          ) : null}

          {results.matched.length > visibleCount ? (
            <div className="restaurant-load-more-row">
              <button
                type="button"
                className="restaurant-load-more-btn"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                더 많은 웨딩 퍼스널 컬러 업체 보기 (+{Math.min(PAGE_SIZE, results.matched.length - visibleCount)}곳)
              </button>
            </div>
          ) : null}
        </>
      )}

      {/* Floating Bottom-Right Map Toggle Button */}
      <button
        type="button"
        className="floating-map-toggle-btn"
        onClick={toggleViewMode}
        aria-label={viewMode === "list" ? "지도 보기로 전환" : "목록 보기로 전환"}
      >
        {viewMode === "list" ? (
          <>
            <MapTrifold size={18} weight="bold" />
            <span>지도</span>
          </>
        ) : (
          <>
            <List size={18} weight="bold" />
            <span>목록</span>
          </>
        )}
      </button>

      {/* Region Picker Modal */}
      <RegionPickerModal
        isOpen={regionModalOpen}
        onClose={() => setRegionModalOpen(false)}
        selectedSidos={selectedSidos}
        selectedRegionCodes={[]}
        selectedDistricts={selectedDistricts}
        onApply={handleRegionApply}
        title="웨딩 퍼스널 컬러 지역 선택"
      />

      {/* Filter Sheet Modal */}
      <PersonalColorFilterSheetModal
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={draft}
        onApply={handleFilterSheetApply}
        totalMatchesCount={draftResults.matched.length + draftResults.unknown.length}
        mode={filterModalMode}
      />
    </section>
  );
}
