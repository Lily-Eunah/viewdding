"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MagnifyingGlass,
  X,
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
  if (filters.gradeAOnly) params.set("gradeA", "1");
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
    Number(filters.priceBudgetMax !== null) +
    Number(filters.gradeAOnly)
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
  if (filters.gradeAOnly) chips.push({ key: "gradeA", label: "A등급 검증" });
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
      gradeAOnly: searchParams.get("gradeA") === "1",
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

  function toggleQuickServiceTag(tag: PersonalColorServiceTag) {
    const exists = applied.serviceTags.includes(tag);
    const nextTags = exists
      ? applied.serviceTags.filter((t) => t !== tag)
      : [...applied.serviceTags, tag];
    commit({ ...applied, serviceTags: nextTags });
  }

  function removeFilterChip(chipKey: string) {
    if (chipKey === "keyword") commit({ ...applied, keyword: "" });
    else if (chipKey === "sido") {
      setSelectedSidos([]);
      commit({ ...applied, sido: "" });
    } else if (chipKey === "district") {
      setSelectedDistricts([]);
      commit({ ...applied, district: "" });
    } else if (chipKey.startsWith("service:")) {
      const tag = chipKey.replace("service:", "") as PersonalColorServiceTag;
      commit({ ...applied, serviceTags: applied.serviceTags.filter((t) => t !== tag) });
    } else if (chipKey === "budget") commit({ ...applied, priceBudgetMax: null });
    else if (chipKey === "gradeA") commit({ ...applied, gradeAOnly: false });
  }

  const regionLabel = useMemo(() => {
    if (applied.district) return applied.district;
    if (applied.sido) return shortSidoLabel(applied.sido as Sido);
    return "전국 지역";
  }, [applied.sido, applied.district]);

  return (
    <div className="search-experience personal-color-experience">
      {/* Header Search Section */}
      <section className="search-header-panel">
        <div className="search-header-top">
          <div className="search-input-wrapper">
            <MagnifyingGlass size={18} className="search-input-icon" />
            <input
              type="text"
              placeholder="업체명, 지역명(강남, 성수, 전주 등), 서비스 검색"
              value={draft.keyword}
              onChange={(e) => setDraft({ ...draft, keyword: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commit({ ...applied, keyword: draft.keyword });
                }
              }}
              className="search-input-field"
            />
            {draft.keyword ? (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setDraft({ ...draft, keyword: "" });
                  commit({ ...applied, keyword: "" });
                }}
                aria-label="검색어 지우기"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            className={`view-mode-toggle-btn ${viewMode === "map" ? "is-active" : ""}`}
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
        </div>

        {/* Quick Filter Bar */}
        <div className="quick-filter-scroll-row">
          {/* Region Picker Trigger */}
          <button
            type="button"
            className={`quick-filter-chip region-chip ${applied.sido || applied.district ? "is-selected" : ""}`}
            onClick={() => setRegionModalOpen(true)}
          >
            <MapPin size={15} weight="fill" />
            <span>{regionLabel}</span>
          </button>

          {/* Quick Service Tags */}
          <button
            type="button"
            className={`quick-filter-chip ${applied.serviceTags.includes("body_shape") ? "is-selected" : ""}`}
            onClick={() => toggleQuickServiceTag("body_shape")}
          >
            <span>골격·체형</span>
          </button>
          <button
            type="button"
            className={`quick-filter-chip ${applied.serviceTags.includes("dress") ? "is-selected" : ""}`}
            onClick={() => toggleQuickServiceTag("dress")}
          >
            <span>드레스·소재</span>
          </button>
          <button
            type="button"
            className={`quick-filter-chip ${applied.serviceTags.includes("makeup_hair") ? "is-selected" : ""}`}
            onClick={() => toggleQuickServiceTag("makeup_hair")}
          >
            <span>헤어·메이크업</span>
          </button>
          <button
            type="button"
            className={`quick-filter-chip ${applied.serviceTags.includes("couple") ? "is-selected" : ""}`}
            onClick={() => toggleQuickServiceTag("couple")}
          >
            <span>커플·신랑</span>
          </button>

          {/* Detail Filter Modal Trigger */}
          <button
            type="button"
            className={`quick-filter-chip filter-modal-trigger ${appliedCount > 0 ? "is-selected" : ""}`}
            onClick={() => {
              setFilterModalMode("all");
              setFilterSheetOpen(true);
            }}
          >
            <SlidersHorizontal size={15} weight="bold" />
            <span>상세 필터</span>
            {appliedCount > 0 ? <span className="filter-count-badge">{appliedCount}</span> : null}
          </button>
        </div>

        {/* Applied Filter Chips Row */}
        {activeFilterChips.length > 0 ? (
          <div className="applied-chips-row">
            {activeFilterChips.map((chip) => (
              <span key={chip.key} className="applied-filter-tag">
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => removeFilterChip(chip.key)}
                  aria-label={`${chip.label} 필터 제거`}
                >
                  <X size={12} weight="bold" />
                </button>
              </span>
            ))}
            <button
              type="button"
              className="applied-filter-reset-btn"
              onClick={() => {
                setSelectedSidos([]);
                setSelectedDistricts([]);
                commit({ ...EMPTY_PERSONAL_COLOR_FILTERS });
              }}
            >
              전체 초기화
            </button>
          </div>
        ) : null}
      </section>

      {/* Main Content Area */}
      {viewMode === "list" ? (
        <section className="search-results-section">
          <div className="search-results-meta">
            <p className="results-count-text">
              총 <strong>{total}</strong>개의 웨딩 퍼스널컬러 업체를 찾았습니다.
            </p>
          </div>

          <div className="restaurant-cards-list">
            {results.matched.slice(0, visibleCount).map(({ vendor }) => (
              <PersonalColorCard key={vendor.id} vendor={vendor} />
            ))}

            {results.unknown.slice(0, Math.max(0, visibleCount - results.matched.length)).map(({ vendor, unknownReasons }) => (
              <PersonalColorCard key={vendor.id} vendor={vendor} unknownReasons={unknownReasons} />
            ))}
          </div>

          {total === 0 ? (
            <div className="search-empty-state">
              <Sparkle size={36} color="var(--muted)" />
              <p className="empty-title">선택한 조건에 맞는 업체가 없습니다.</p>
              <p className="empty-desc">지역이나 진단 서비스 필터를 변경해 보세요.</p>
              <button
                type="button"
                className="empty-reset-btn"
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

          {visibleCount < total ? (
            <div className="search-load-more-wrapper">
              <button
                type="button"
                className="search-load-more-btn"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                더보기 ({visibleCount}/{total})
              </button>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="search-map-section" style={{ height: "calc(100svh - 180px)", minHeight: "500px" }}>
          <KakaoPersonalColorMap vendors={mapVendors} appKey={kakaoMapAppKey} />
        </section>
      )}

      {/* Region Picker Modal */}
      <RegionPickerModal
        isOpen={regionModalOpen}
        onClose={() => setRegionModalOpen(false)}
        selectedSidos={selectedSidos}
        selectedRegionCodes={[]}
        selectedDistricts={selectedDistricts}
        onApply={(sidos, _regionCodes, districts) => {
          setSelectedSidos(sidos);
          setSelectedDistricts(districts);
          commit({
            ...applied,
            sido: sidos[0] ?? "",
            district: districts[0] ?? "",
          });
        }}
        title="웨딩 퍼스널 컬러 지역 선택"
      />

      {/* Filter Sheet Modal */}
      <PersonalColorFilterSheetModal
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={draft}
        onApply={(next) => commit(next)}
        totalMatchesCount={draftResults.matched.length + draftResults.unknown.length}
        mode={filterModalMode}
      />
    </div>
  );
}
