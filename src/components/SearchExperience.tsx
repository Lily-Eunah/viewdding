"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "@phosphor-icons/react";
import { EMPTY_FILTERS, filterHalls } from "@/domain/filter";
import { groupFilteredHallsByVenue } from "@/domain/hall-map";
import { REGION_DEFINITIONS, shortSidoLabel, SIDO_OPTIONS } from "@/domain/regions";
import type { CeremonyFormat, FilterState, HallTypeFilter, MealType, Sido } from "@/domain/types";
import { availableSidos, halls, sigunguBySido } from "@/lib/data";
import { CEREMONY_OPTIONS, HALL_TYPE_GROUPS, INTERVAL_OPTIONS, MEAL_OPTIONS, hallTypeLabel } from "@/lib/labels";
import { HallCard } from "./HallCard";
import { KakaoHallMap } from "./KakaoHallMap";

const PAGE_SIZE = 24;
const REGION_BY_CODE = new Map(REGION_DEFINITIONS.map((region) => [region.regionCode, region]));
type ViewMode = "list" | "map";

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function typeSummary(types: HallTypeFilter[]): string {
  if (types.length === 0) return "웨딩홀 타입";
  if (types.length <= 2) return types.map(hallTypeLabel).join(" · ");
  return `${hallTypeLabel(types[0])} 외 ${types.length - 1}개`;
}

function queryFromFilters(filters: FilterState, viewMode: ViewMode): string {
  const params = new URLSearchParams();
  if (viewMode === "map") params.set("view", "map");
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
  return filters.sidos.length + filters.regionCodes.length + filters.hallTypes.length + Number(filters.guests !== null)
    + Number(filters.naturalLight) + filters.ceremonyFormats.length + Number(filters.intervalAtLeast !== null)
    + filters.meals.length;
}

function regionLabel(regionCode: string): string {
  const region = REGION_BY_CODE.get(regionCode);
  return region ? `${shortSidoLabel(region.sido)} · ${region.sigungu}` : regionCode;
}

function locationSummary(filters: FilterState): string {
  const labels = [
    ...filters.sidos.map((sido) => `${shortSidoLabel(sido)} 전체`),
    ...filters.regionCodes.map(regionLabel),
  ];
  if (labels.length === 0) return "전체 지역";
  if (labels.length === 1) return labels[0];
  return `${labels[0]} 외 ${labels.length - 1}개`;
}

export function SearchExperience({
  compact = false,
  kakaoMapAppKey = "",
}: {
  compact?: boolean;
  kakaoMapAppKey?: string;
}) {
  const [draft, setDraft] = useState<FilterState>({ ...EMPTY_FILTERS });
  const [applied, setApplied] = useState<FilterState>({ ...EMPTY_FILTERS });
  const [pickerTypes, setPickerTypes] = useState<HallTypeFilter[]>([]);
  const [typeOpen, setTypeOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [activeSido, setActiveSido] = useState<Sido>("서울특별시");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const legacyHall = halls.find((hall) => hall.district === params.get("district"));
    const requestedSidos = Array.from(new Set(
      params.getAll("sido").flatMap((value) => value.split(","))
        .filter((value): value is Sido => SIDO_OPTIONS.some((option) => option.value === value)),
    ));
    const requestedRegionCodes = params.getAll("region").flatMap((value) => value.split(","))
      .filter((regionCode) => REGION_BY_CODE.has(regionCode));
    const legacySigungu = params.get("sigungu") ?? legacyHall?.sigungu ?? "";
    const legacySido = requestedSidos[0] ?? legacyHall?.sido;
    const legacyRegionCode = legacySido && legacySigungu
      ? REGION_DEFINITIONS.find((region) => region.sido === legacySido && region.sigungu === legacySigungu)?.regionCode
      : legacyHall?.regionCode;
    const requestedMetroAreas = params.getAll("metro").flatMap((value) => value.split(","));
    const legacyMetroRegionCodes = REGION_DEFINITIONS
      .filter((region) => requestedMetroAreas.includes(region.metroArea) && halls.some((hall) => hall.regionCode === region.regionCode))
      .map((region) => region.regionCode);
    const hasSpecificLegacyRegion = Boolean(legacyRegionCode && legacySigungu);
    const sidos = hasSpecificLegacyRegion && legacySido
      ? requestedSidos.filter((sido) => sido !== legacySido)
      : requestedSidos;
    const regionCodes = Array.from(new Set([
      ...requestedRegionCodes,
      ...(legacyRegionCode ? [legacyRegionCode] : []),
      ...legacyMetroRegionCodes,
    ])).filter((regionCode) => {
      const region = REGION_BY_CODE.get(regionCode);
      return region ? !sidos.includes(region.sido) : false;
    });
    const parsed: FilterState = {
      sidos,
      regionCodes,
      hallTypes: (params.get("types")?.split(",").filter(Boolean) ?? []) as HallTypeFilter[],
      guests: params.get("guests") ? Number(params.get("guests")) : null,
      naturalLight: params.get("natural") === "1",
      ceremonyFormats: (params.get("ceremony")?.split(",").filter(Boolean) ?? []) as Exclude<CeremonyFormat, "unknown">[],
      intervalAtLeast: params.get("interval") ? Number(params.get("interval")) : null,
      meals: (params.get("meals")?.split(",").filter(Boolean) ?? []) as Exclude<MealType, "no_meal" | "other">[],
    };
    setDraft(parsed);
    setApplied(parsed);
    setPickerTypes(parsed.hallTypes);
    setViewMode(params.get("view") === "map" ? "map" : "list");
    setRegionOpen(parsed.sidos.length > 0 || parsed.regionCodes.length > 0);
    setActiveSido(parsed.sidos[0] ?? REGION_BY_CODE.get(parsed.regionCodes[0])?.sido ?? "서울특별시");
    if (parsed.guests || parsed.naturalLight || parsed.ceremonyFormats.length || parsed.intervalAtLeast || parsed.meals.length) setDetailOpen(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("hall-mobile-map-active", viewMode === "map");
    return () => document.body.classList.remove("hall-mobile-map-active");
  }, [viewMode]);

  useEffect(() => {
    if (!mobileFilterOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDraft({ ...applied, sidos: [...applied.sidos], regionCodes: [...applied.regionCodes], hallTypes: [...applied.hallTypes], ceremonyFormats: [...applied.ceremonyFormats], meals: [...applied.meals] });
        setPickerTypes(applied.hallTypes);
        setTypeOpen(false);
        setMobileFilterOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [applied, mobileFilterOpen]);

  const results = useMemo(() => filterHalls(halls, applied), [applied]);
  const draftResults = useMemo(() => filterHalls(halls, draft), [draft]);
  const mapVenues = useMemo(
    () => groupFilteredHallsByVenue([...results.matched, ...results.unknown]),
    [results],
  );
  const regionVenueCounts = useMemo(() => new Map(
    REGION_DEFINITIONS.map((region) => [
      region.regionCode,
      new Set(halls.filter((hall) => hall.regionCode === region.regionCode).map((hall) => hall.venueId)).size,
    ]),
  ), []);
  const sidoVenueCounts = useMemo(() => new Map(
    SIDO_OPTIONS.map(({ value }) => [
      value,
      new Set(halls.filter((hall) => hall.sido === value).map((hall) => hall.venueId)).size,
    ]),
  ), []);
  useEffect(() => setVisible(PAGE_SIZE), [applied]);

  const detailCount = Number(draft.guests !== null) + Number(draft.naturalLight) + draft.ceremonyFormats.length + Number(draft.intervalAtLeast !== null) + draft.meals.length;
  function commit(next: FilterState) {
    setApplied(next);
    setDraft(next);
    const query = queryFromFilters(next, viewMode);
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  function updateFilters(next: FilterState) {
    if (mobileFilterOpen) setDraft(next);
    else commit(next);
  }

  function toggleSido(sido: Sido) {
    const selected = draft.sidos.includes(sido);
    updateFilters({
      ...draft,
      sidos: selected ? draft.sidos.filter((item) => item !== sido) : [...draft.sidos, sido],
      regionCodes: selected
        ? draft.regionCodes
        : draft.regionCodes.filter((regionCode) => REGION_BY_CODE.get(regionCode)?.sido !== sido),
    });
  }

  function toggleRegionCode(regionCode: string) {
    const sido = REGION_BY_CODE.get(regionCode)?.sido;
    updateFilters({
      ...draft,
      sidos: sido ? draft.sidos.filter((item) => item !== sido) : draft.sidos,
      regionCodes: toggleValue(draft.regionCodes, regionCode),
    });
  }

  function switchViewMode(nextViewMode: ViewMode) {
    setViewMode(nextViewMode);
    setMobileFilterOpen(false);
    const query = queryFromFilters(applied, nextViewMode);
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  const chips: Array<{ key: string; label: string; remove: () => void }> = [];
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
  applied.hallTypes.forEach((type) => chips.push({ key: `type-${type}`, label: hallTypeLabel(type), remove: () => commit({ ...applied, hallTypes: applied.hallTypes.filter((item) => item !== type) }) }));
  if (applied.guests !== null) chips.push({ key: "guests", label: `${applied.guests}명`, remove: () => commit({ ...applied, guests: null }) });
  if (applied.naturalLight) chips.push({ key: "natural", label: "자연광 있음", remove: () => commit({ ...applied, naturalLight: false }) });
  applied.ceremonyFormats.forEach((value) => chips.push({ key: `ceremony-${value}`, label: CEREMONY_OPTIONS.find((option) => option.value === value)?.label ?? value, remove: () => commit({ ...applied, ceremonyFormats: applied.ceremonyFormats.filter((item) => item !== value) }) }));
  if (applied.intervalAtLeast !== null) chips.push({ key: "interval", label: `${applied.intervalAtLeast}분 이상`, remove: () => commit({ ...applied, intervalAtLeast: null }) });
  applied.meals.forEach((value) => chips.push({ key: `meal-${value}`, label: MEAL_OPTIONS.find((option) => option.value === value)?.label ?? value, remove: () => commit({ ...applied, meals: applied.meals.filter((item) => item !== value) }) }));

  const selectedCount = filterSelectionCount(draft);
  const appliedCount = filterSelectionCount(applied);
  const total = results.matched.length + results.unknown.length;
  const draftTotal = draftResults.matched.length + draftResults.unknown.length;
  const draftLocationChips = [
    ...draft.sidos.map((sido) => ({
      key: `draft-sido-${sido}`,
      label: `${shortSidoLabel(sido)} 전체`,
      remove: () => toggleSido(sido),
    })),
    ...draft.regionCodes.map((regionCode) => ({
      key: `draft-region-${regionCode}`,
      label: regionLabel(regionCode),
      remove: () => toggleRegionCode(regionCode),
    })),
  ];
  const activeSidoRegionCodes = sigunguBySido[activeSido]
    .map((sigungu) => REGION_DEFINITIONS.find((region) => region.sido === activeSido && region.sigungu === sigungu)?.regionCode)
    .filter((regionCode): regionCode is string => Boolean(regionCode) && (regionVenueCounts.get(regionCode ?? "") ?? 0) > 0);

  return (
    <section className={`search-experience${compact ? " is-compact" : ""}${viewMode === "map" ? " is-map-mode" : ""}${mobileFilterOpen ? " is-mobile-filter-open" : ""}`}>
      {viewMode === "map" ? (
        <div className="mobile-map-toolbar">
          <div className="mobile-map-toolbar-row">
            <button type="button" className="mobile-map-list-button" onClick={() => switchViewMode("list")}>‹ 목록</button>
            <div className="mobile-map-title">웨딩홀 지도</div>
            <button type="button" className="mobile-map-filter-button" aria-expanded={mobileFilterOpen} onClick={() => { setDetailOpen(true); setMobileFilterOpen(true); }}>필터{appliedCount ? ` ${appliedCount}` : ""}</button>
          </div>
          {chips.length > 0 ? <div className="mobile-map-filter-chips" aria-label="적용된 필터">{chips.map((chip) => <button key={chip.key} type="button" aria-label={`${chip.label} 필터 해제`} onClick={chip.remove}>{chip.label} <span className="filter-chip-remove" aria-hidden="true">해제</span></button>)}</div> : null}
        </div>
      ) : null}

      {viewMode === "map" && mobileFilterOpen ? <button type="button" className="mobile-filter-backdrop" aria-label="필터 닫기" onClick={() => { setDraft({ ...applied, sidos: [...applied.sidos], regionCodes: [...applied.regionCodes], hallTypes: [...applied.hallTypes], ceremonyFormats: [...applied.ceremonyFormats], meals: [...applied.meals] }); setPickerTypes(applied.hallTypes); setTypeOpen(false); setMobileFilterOpen(false); }} /> : null}

      <form
        className="search-panel"
        role={viewMode === "map" && mobileFilterOpen ? "dialog" : undefined}
        aria-label={viewMode === "map" && mobileFilterOpen ? "웨딩홀 필터" : undefined}
        onSubmit={(event) => {
          event.preventDefault();
          commit(draft);
          setMobileFilterOpen(false);
          if (viewMode === "list") document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <div className="mobile-filter-sheet-header">
          <strong>FILTER</strong>
          <div className="mobile-filter-sheet-actions">
            {selectedCount > 0 ? <button type="button" className="mobile-filter-reset" onClick={() => { setDraft({ ...EMPTY_FILTERS, sidos: [], regionCodes: [], hallTypes: [], ceremonyFormats: [], meals: [] }); setPickerTypes([]); setTypeOpen(false); }}>초기화</button> : null}
            <button type="button" className="mobile-filter-close" onClick={() => { setDraft({ ...applied, sidos: [...applied.sidos], regionCodes: [...applied.regionCodes], hallTypes: [...applied.hallTypes], ceremonyFormats: [...applied.ceremonyFormats], meals: [...applied.meals] }); setPickerTypes(applied.hallTypes); setTypeOpen(false); setMobileFilterOpen(false); }} aria-label="필터 닫기" title="필터 닫기"><X aria-hidden="true" size={20} /></button>
          </div>
        </div>
        <div className="secondary-filter-grid">
          <div className="region-picker">
            <span className="field-caption">지역 · 여러 곳 선택 가능</span>
            <button className="field-button" type="button" aria-expanded={regionOpen} onClick={() => setRegionOpen(!regionOpen)}>{locationSummary(draft)}</button>
          </div>
          <div className="type-picker">
            <span className="field-caption">웨딩홀 타입</span>
            <button className="field-button" type="button" aria-expanded={typeOpen} onClick={() => { setPickerTypes(draft.hallTypes); setTypeOpen(!typeOpen); }}>{typeSummary(draft.hallTypes)}</button>
            {typeOpen ? <div className="type-picker-panel">
              {HALL_TYPE_GROUPS.map((group) => <fieldset key={group.label}><legend>{group.label}</legend><div className="option-row">{group.options.map((option) => <button key={option.value} type="button" className={pickerTypes.includes(option.value) ? "option is-selected" : "option"} aria-pressed={pickerTypes.includes(option.value)} onClick={() => setPickerTypes(toggleValue(pickerTypes, option.value))}>{option.label}</button>)}</div></fieldset>)}
              <button type="button" className="complete-button" onClick={() => { updateFilters({ ...draft, hallTypes: pickerTypes }); setTypeOpen(false); }}>선택 완료</button>
            </div> : null}
          </div>
        </div>

        {draftLocationChips.length > 0 ? <div className="draft-location-chips" aria-label="선택한 지역">{draftLocationChips.map((chip) => <button key={chip.key} type="button" aria-label={`${chip.label} 지역 해제`} onClick={chip.remove}>{chip.label}<span aria-hidden="true">해제</span></button>)}</div> : null}

        {regionOpen ? <div className="region-multi-panel">
          <div className="region-sido-tabs" role="tablist" aria-label="시·도 선택">
            {SIDO_OPTIONS.map((option) => {
              const selectedInSido = Number(draft.sidos.includes(option.value))
                + draft.regionCodes.filter((regionCode) => REGION_BY_CODE.get(regionCode)?.sido === option.value).length;
              const available = availableSidos.includes(option.value);
              return <button key={option.value} type="button" role="tab" aria-selected={activeSido === option.value} disabled={!available} className={activeSido === option.value ? "is-selected" : ""} onClick={() => setActiveSido(option.value)}>{option.shortLabel}{selectedInSido ? ` ${selectedInSido}` : ""}{available ? "" : " · 준비 중"}</button>;
            })}
          </div>
          <div className="region-option-panel" role="tabpanel">
            <div className="region-option-heading"><strong>{activeSido}</strong><span>원하는 지역을 여러 곳 고를 수 있어요.</span></div>
            <div className="region-option-grid">
              <button type="button" className={draft.sidos.includes(activeSido) ? "region-option is-selected" : "region-option"} aria-pressed={draft.sidos.includes(activeSido)} onClick={() => toggleSido(activeSido)}><span>{shortSidoLabel(activeSido)} 전체</span><small>예식장 {sidoVenueCounts.get(activeSido) ?? 0}곳</small></button>
              {activeSidoRegionCodes.map((regionCode) => {
                const region = REGION_BY_CODE.get(regionCode);
                return <button key={regionCode} type="button" className={draft.regionCodes.includes(regionCode) ? "region-option is-selected" : "region-option"} aria-pressed={draft.regionCodes.includes(regionCode)} onClick={() => toggleRegionCode(regionCode)}><span>{region?.sigungu ?? regionCode}</span><small>예식장 {regionVenueCounts.get(regionCode) ?? 0}곳</small></button>;
              })}
            </div>
          </div>
          <button className="region-panel-close" type="button" onClick={() => setRegionOpen(false)}>지역 선택 닫기</button>
        </div> : null}

        <button className="detail-toggle" type="button" aria-expanded={detailOpen} onClick={() => setDetailOpen(!detailOpen)}>{detailOpen ? "−" : "+"} 상세 조건{detailCount ? ` ${detailCount}` : ""}</button>
        {detailOpen ? <div className="detail-panel">
          <label className="detail-field"><span>예상 하객 수</span><input type="number" min="1" placeholder="예: 200" value={draft.guests ?? ""} onChange={(event) => updateFilters({ ...draft, guests: event.target.value ? Number(event.target.value) : null })} /></label>
          <fieldset><legend>자연광</legend><button type="button" className={draft.naturalLight ? "option is-selected" : "option"} aria-pressed={draft.naturalLight} onClick={() => updateFilters({ ...draft, naturalLight: !draft.naturalLight })}>자연광 있음</button></fieldset>
          <fieldset><legend>예식 형태</legend><div className="option-row">{CEREMONY_OPTIONS.map((option) => <button key={option.value} type="button" className={draft.ceremonyFormats.includes(option.value) ? "option is-selected" : "option"} onClick={() => updateFilters({ ...draft, ceremonyFormats: toggleValue(draft.ceremonyFormats, option.value) })}>{option.label}</button>)}</div></fieldset>
          <fieldset><legend>예식 간격</legend><div className="option-row">{INTERVAL_OPTIONS.map((interval) => <button key={interval} type="button" className={draft.intervalAtLeast === interval ? "option is-selected" : "option"} onClick={() => updateFilters({ ...draft, intervalAtLeast: draft.intervalAtLeast === interval ? null : interval })}>{interval}분 이상</button>)}</div></fieldset>
          <fieldset className="detail-wide"><legend>식사 유형</legend><div className="option-row">{MEAL_OPTIONS.map((option) => <button key={option.value} type="button" className={draft.meals.includes(option.value) ? "option is-selected" : "option"} onClick={() => updateFilters({ ...draft, meals: toggleValue(draft.meals, option.value) })}>{option.label}</button>)}</div></fieldset>
          <p className="missing-policy">값이 없는 홀은 제외하지 않고 ‘정보 확인이 필요한 홀’로 분리합니다. <Link href="/methodology/">분류 기준 보기</Link></p>
        </div> : null}
        <button className="mobile-filter-apply" type="submit">{selectedCount ? `${draftTotal}개 홀 보기` : "전체 웨딩홀 보기"}</button>
      </form>

      <div id="search-results" className="results-heading">
        <div className="applied-chips">{chips.map((chip) => <button key={chip.key} type="button" aria-label={`${chip.label} 필터 해제`} onClick={chip.remove}>{chip.label}<span className="filter-chip-remove" aria-hidden="true">해제</span></button>)}</div>
        <div className="result-heading-row">
          <div className="result-summary" aria-live="polite"><strong>조건 확인 {results.matched.length}개 홀</strong><span>정보 미확인 {results.unknown.length}개 · 총 {total}개 홀</span></div>
          <div className="result-view-switch" role="group" aria-label="결과 보기 방식">
            <button type="button" className={viewMode === "list" ? "is-selected" : ""} aria-pressed={viewMode === "list"} onClick={() => switchViewMode("list")}>목록</button>
            <button type="button" className={viewMode === "map" ? "is-selected" : ""} aria-pressed={viewMode === "map"} onClick={() => switchViewMode("map")}>지도</button>
          </div>
        </div>
      </div>

      {viewMode === "map" ? (
        <KakaoHallMap venues={mapVenues} appKey={kakaoMapAppKey} />
      ) : (
        <>
          <div className="result-list">{results.matched.slice(0, visible).map((item) => <HallCard key={item.hall.id} hall={item.hall} />)}</div>
          {visible < results.matched.length ? <button type="button" className="more-button" onClick={() => setVisible(visible + PAGE_SIZE)}>홀 더 보기</button> : null}
          {results.matched.length === 0 ? <div className="empty-state"><h3>조건이 확인된 홀이 없어요.</h3><p>조건을 하나 줄이거나 정보 미확인 결과를 확인해보세요.</p></div> : null}
          {results.unknown.length > 0 ? <details className="unknown-results"><summary>정보 확인이 필요한 홀 {results.unknown.length}개 보기</summary><p>선택한 조건과 명확히 다르지는 않지만 일부 값이 공개되지 않은 홀입니다.</p><div className="result-list">{results.unknown.slice(0, 24).map((item) => <HallCard key={item.hall.id} hall={item.hall} unknownReasons={item.unknownReasons} />)}</div></details> : null}
        </>
      )}
    </section>
  );
}
