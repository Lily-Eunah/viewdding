"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "@phosphor-icons/react";
import { EMPTY_RESTAURANT_FILTERS } from "@/domain/restaurant-filter";
import { isRestaurantCuisineCategory, RESTAURANT_CUISINE_CATEGORIES } from "@/domain/restaurant-cuisine";
import type { RestaurantCuisineCategory } from "@/domain/restaurant-cuisine";
import type { RestaurantMapBounds } from "@/domain/restaurant-map";
import type { FilteredRestaurant, GatheringPurpose, RestaurantFilterState, RestaurantRecord, Weekday } from "@/domain/restaurant-types";
import {
  EMPTY_COUNTS,
  fetchRestaurantCounts,
  fetchRestaurantList,
  fetchRestaurantMap,
  fetchSearchMeta,
  type SearchCounts,
} from "@/lib/search-api";
import { KakaoRestaurantMap } from "./KakaoRestaurantMap";
import styles from "./RestaurantMapEnhancements.module.css";
import { RestaurantCard } from "./RestaurantCard";

const WEEKDAYS: Array<{ value: Weekday; label: string }> = [
  { value: "mon", label: "월요일" }, { value: "tue", label: "화요일" },
  { value: "wed", label: "수요일" }, { value: "thu", label: "목요일" },
  { value: "fri", label: "금요일" }, { value: "sat", label: "토요일" },
  { value: "sun", label: "일요일" },
];
const BUDGETS = [30000, 50000, 70000, 100000, 150000, 200000];
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

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function cuisineCategoriesFrom(value: string | null): RestaurantCuisineCategory[] {
  return value?.split(",").filter(isRestaurantCuisineCategory) ?? [];
}

function filterSelectionCount(filters: RestaurantFilterState): number {
  return Number(filters.weekday !== null) + filters.cuisines.length + Number(filters.budgetMax !== null)
    + Number(filters.privateRoomOnly && filters.partySize !== null) + Number(filters.courseOnly) + Number(filters.privateRoomOnly)
    + Number(filters.parkingOnly) + Number(Boolean(filters.district)) + Number(Boolean(filters.area));
}

function appliedFilterChips(filters: RestaurantFilterState): AppliedFilterChip[] {
  const chips: AppliedFilterChip[] = [];
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
  kakaoMapAppKey,
}: {
  kakaoMapAppKey: string;
}) {
  const [draft, setDraft] = useState<RestaurantFilterState>({ ...EMPTY_RESTAURANT_FILTERS });
  const [applied, setApplied] = useState<RestaurantFilterState>({ ...EMPTY_RESTAURANT_FILTERS });
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [districtsByPurpose, setDistrictsByPurpose] = useState<Record<GatheringPurpose, string[]>>({ invitation: [], family_meeting: [] });
  const [areasByPurpose, setAreasByPurpose] = useState<Record<GatheringPurpose, Record<string, string[]>>>({ invitation: {}, family_meeting: {} });
  const [matched, setMatched] = useState<FilteredRestaurant[]>([]);
  const [unknown, setUnknown] = useState<FilteredRestaurant[]>([]);
  const [counts, setCounts] = useState<SearchCounts>(EMPTY_COUNTS);
  const [draftCounts, setDraftCounts] = useState<SearchCounts>(EMPTY_COUNTS);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [mapRestaurants, setMapRestaurants] = useState<RestaurantRecord[]>([]);
  const [mapBounds, setMapBounds] = useState<RestaurantMapBounds | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const privateRoomOnly = params.get("room") === "1";
    const parsed: RestaurantFilterState = {
      purpose: purposeFrom(params.get("purpose")),
      district: params.get("district") ?? "",
      area: params.get("area") ?? "",
      weekday: (params.get("weekday") as Weekday | null) ?? null,
      cuisines: cuisineCategoriesFrom(params.get("cuisines")),
      budgetMax: params.get("budget") ? Number(params.get("budget")) : null,
      partySize: privateRoomOnly && params.get("people") ? Number(params.get("people")) : null,
      courseOnly: params.get("course") === "1",
      privateRoomOnly,
      parkingOnly: params.get("parking") === "1",
    };
    setDraft(parsed);
    setApplied(parsed);
    setViewMode(params.get("view") === "map" ? "map" : "list");
    if (parsed.weekday || parsed.cuisines.length || parsed.budgetMax || parsed.partySize || parsed.courseOnly || parsed.privateRoomOnly || parsed.parkingOnly) setDetailOpen(true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchSearchMeta(controller.signal).then((meta) => {
      setDistrictsByPurpose(meta.restaurants.districts);
      setAreasByPurpose(meta.restaurants.areas);
    }).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) setLoadError(true);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);
    if (viewMode === "list") {
      setMatched([]);
      setUnknown([]);
      setNextOffset(null);
    }
    const request = viewMode === "map"
      ? fetchRestaurantMap(applied, mapBounds, controller.signal).then((response) => {
          setMapRestaurants(response.items);
          setCounts(response.counts);
        })
      : fetchRestaurantList(applied, 0, controller.signal).then((response) => {
          setMatched(response.matched);
          setUnknown(response.unknown);
          setCounts(response.counts);
          setNextOffset(response.nextOffset);
        });
    request.catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) setLoadError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [applied, hydrated, mapBounds, viewMode]);

  useEffect(() => {
    if (!hydrated) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchRestaurantCounts(draft, controller.signal).then((response) => setDraftCounts(response.counts)).catch(() => undefined);
    }, 150);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [draft, hydrated]);

  useEffect(() => {
    document.body.classList.toggle("restaurant-mobile-map-active", viewMode === "map");
    return () => document.body.classList.remove("restaurant-mobile-map-active");
  }, [viewMode]);

  useEffect(() => {
    if (!mobileFilterOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDraft({ ...applied, cuisines: [...applied.cuisines] });
        setMobileFilterOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [applied, mobileFilterOpen]);

  const districts = districtsByPurpose[draft.purpose];
  const areas = draft.district ? areasByPurpose[draft.purpose][draft.district] ?? [] : [];
  const activeFilterChips = useMemo(() => appliedFilterChips(applied), [applied]);

  function replaceUrl(filters: RestaurantFilterState, nextViewMode: ViewMode = viewMode) {
    window.history.replaceState(null, "", `${window.location.pathname}?${queryFromFilters(filters, nextViewMode)}`);
  }

  function switchPurpose(purpose: GatheringPurpose) {
    const next = { ...draft, purpose, district: "", area: "", cuisines: [] };
    setDraft(next);
    setApplied(next);
    setMapBounds(null);
    setMapRestaurants([]);
    replaceUrl(next);
  }

  function commit(next: RestaurantFilterState) {
    setDraft(next);
    setApplied(next);
    setMapBounds(null);
    setMapRestaurants([]);
    replaceUrl(next);
  }

  function switchViewMode(nextViewMode: ViewMode) {
    setMobileFilterOpen(false);
    if (nextViewMode === "map") setMapBounds(null);
    setViewMode(nextViewMode);
    replaceUrl(applied, nextViewMode);
  }

  function clearAppliedFilter(key: string) {
    const next = { ...applied };
    if (key === "district") {
      next.district = "";
      next.area = "";
    } else if (key === "area") next.area = "";
    else if (key === "weekday") next.weekday = null;
    else if (key.startsWith("cuisine:")) next.cuisines = next.cuisines.filter((cuisine) => `cuisine:${cuisine}` !== key);
    else if (key === "budget") next.budgetMax = null;
    else if (key === "people") next.partySize = null;
    else if (key === "course") next.courseOnly = false;
    else if (key === "room") {
      next.privateRoomOnly = false;
      next.partySize = null;
    }
    else if (key === "parking") next.parkingOnly = false;
    commit(next);
  }

  const selectedCount = filterSelectionCount(draft);
  const appliedCount = filterSelectionCount(applied);

  async function loadMore() {
    if (nextOffset === null || loading) return;
    setLoading(true);
    try {
      const response = await fetchRestaurantList(applied, nextOffset);
      setMatched((current) => [...current, ...response.matched]);
      setNextOffset(response.nextOffset);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`restaurant-search-experience${viewMode === "map" ? " is-map-mode" : ""}${mobileFilterOpen ? " is-mobile-filter-open" : ""}`}>
      {viewMode === "map" ? (
        <div className="mobile-map-toolbar">
          <div className="mobile-map-toolbar-row">
            <button type="button" className="mobile-map-list-button" onClick={() => switchViewMode("list")}>‹ 목록</button>
            <div className="mobile-map-purpose-toggle" role="radiogroup" aria-label="모임 종류">
              <button type="button" role="radio" aria-checked={draft.purpose === "invitation"} className={draft.purpose === "invitation" ? "is-selected" : ""} onClick={() => switchPurpose("invitation")}>청첩장</button>
              <button type="button" role="radio" aria-checked={draft.purpose === "family_meeting"} className={draft.purpose === "family_meeting" ? "is-selected" : ""} onClick={() => switchPurpose("family_meeting")}>상견례</button>
            </div>
            <button type="button" className="mobile-map-filter-button" aria-expanded={mobileFilterOpen} onClick={() => { setDetailOpen(true); setMobileFilterOpen(true); }}>필터{appliedCount ? ` ${appliedCount}` : ""}</button>
          </div>
          {activeFilterChips.length > 0 ? (
            <div className="mobile-map-filter-chips" aria-label="적용된 필터">
              {activeFilterChips.map((chip) => <button key={chip.key} type="button" aria-label={`${chip.label} 필터 해제`} onClick={() => clearAppliedFilter(chip.key)}>{chip.label} <span className="filter-chip-remove" aria-hidden="true">해제</span></button>)}
            </div>
          ) : null}
        </div>
      ) : null}

      {viewMode === "map" && mobileFilterOpen ? <button type="button" className="mobile-filter-backdrop" aria-label="필터 닫기" onClick={() => { setDraft({ ...applied, cuisines: [...applied.cuisines] }); setMobileFilterOpen(false); }} /> : null}

      <div className="purpose-toggle" role="radiogroup" aria-label="모임 종류">
        <button type="button" role="radio" aria-checked={draft.purpose === "invitation"} className={draft.purpose === "invitation" ? "is-selected" : ""} onClick={() => switchPurpose("invitation")}>청첩장 모임</button>
        <button type="button" role="radio" aria-checked={draft.purpose === "family_meeting"} className={draft.purpose === "family_meeting" ? "is-selected" : ""} onClick={() => switchPurpose("family_meeting")}>상견례</button>
      </div>

      <form
        className="search-panel"
        role={viewMode === "map" && mobileFilterOpen ? "dialog" : undefined}
        aria-label={viewMode === "map" && mobileFilterOpen ? "음식점 필터" : undefined}
        onSubmit={(event) => {
          event.preventDefault();
          commit(draft);
          setMobileFilterOpen(false);
          if (viewMode === "list") document.getElementById("restaurant-results")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <div className="mobile-filter-sheet-header">
          <strong>FILTER</strong>
          <div className="mobile-filter-sheet-actions">
            {selectedCount > 0 ? <button type="button" className="mobile-filter-reset" onClick={() => setDraft({ ...EMPTY_RESTAURANT_FILTERS, purpose: draft.purpose, cuisines: [] })}>초기화</button> : null}
            <button type="button" className="mobile-filter-close" onClick={() => { setDraft({ ...applied, cuisines: [...applied.cuisines] }); setMobileFilterOpen(false); }} aria-label="필터 닫기" title="필터 닫기"><X aria-hidden="true" size={20} /></button>
          </div>
        </div>
        <div className="restaurant-filter-grid">
          <label className="field-label"><span>서울 구</span><select value={draft.district} onChange={(event) => setDraft({ ...draft, district: event.target.value, area: "" })}><option value="">서울 전체</option>{districts.map((district) => <option key={district}>{district}</option>)}</select></label>
          <label className="field-label"><span>동네·역</span><select value={draft.area} onChange={(event) => setDraft({ ...draft, area: event.target.value })}><option value="">전체</option>{areas.map((area) => <option key={area}>{area}</option>)}</select></label>
          <label className="field-label"><span>방문 요일</span><select value={draft.weekday ?? ""} onChange={(event) => setDraft({ ...draft, weekday: (event.target.value || null) as Weekday | null })}><option value="">요일 전체</option>{WEEKDAYS.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}</select></label>
          <button className="search-button" type="submit">찾기</button>
        </div>

        <button className="detail-toggle" type="button" aria-expanded={detailOpen} onClick={() => setDetailOpen(!detailOpen)}>{detailOpen ? "−" : "+"} 상세 조건{selectedCount ? ` ${selectedCount}` : ""}</button>
        {detailOpen ? <div className="restaurant-detail-panel">
          <fieldset className={`restaurant-cuisine-field ${styles.cuisineField}`}><legend>음식 종류</legend><div className="option-row">{RESTAURANT_CUISINE_CATEGORIES.map((cuisine) => <button key={cuisine} type="button" className={draft.cuisines.includes(cuisine) ? "option is-selected" : "option"} aria-pressed={draft.cuisines.includes(cuisine)} onClick={() => setDraft({ ...draft, cuisines: toggleValue(draft.cuisines, cuisine) })}>{cuisine}</button>)}</div></fieldset>
          <label className="field-label"><span>1인 최대 예산</span><select value={draft.budgetMax ?? ""} onChange={(event) => setDraft({ ...draft, budgetMax: event.target.value ? Number(event.target.value) : null })}><option value="">가격 전체</option>{BUDGETS.map((budget) => <option key={budget} value={budget}>{budget.toLocaleString("ko-KR")}원</option>)}</select></label>
          <fieldset className="restaurant-boolean-filters"><legend>필수 조건</legend><div className="option-row">
            <button type="button" className={draft.courseOnly ? "option is-selected" : "option"} aria-pressed={draft.courseOnly} onClick={() => setDraft({ ...draft, courseOnly: !draft.courseOnly })}>코스 가능</button>
            <div className="restaurant-room-condition">
              <button type="button" className={draft.privateRoomOnly ? "option is-selected" : "option"} aria-pressed={draft.privateRoomOnly} onClick={() => setDraft({ ...draft, privateRoomOnly: !draft.privateRoomOnly, partySize: draft.privateRoomOnly ? null : draft.partySize })}>룸 있음</button>
              {draft.privateRoomOnly ? <label className="restaurant-room-count"><input type="number" inputMode="numeric" min="1" aria-label="룸 이용 인원" placeholder="6" value={draft.partySize ?? ""} onChange={(event) => setDraft({ ...draft, partySize: event.target.value ? Number(event.target.value) : null })} /><span aria-hidden="true">명</span></label> : null}
            </div>
            <button type="button" className={draft.parkingOnly ? "option is-selected" : "option"} aria-pressed={draft.parkingOnly} onClick={() => setDraft({ ...draft, parkingOnly: !draft.parkingOnly })}>주차 가능</button>
          </div></fieldset>
          <p className="missing-policy">선택한 요일이 정기 휴무인 음식점은 제외합니다. 휴무일을 확인하지 못한 곳은 ‘정보 확인 필요’로 분리합니다.</p>
        </div> : null}
        <button className="mobile-filter-apply" type="submit">{selectedCount ? `${draftCounts.total}개 장소 보기` : "전체 음식점 보기"}</button>
      </form>

      <div id="restaurant-results" className="results-heading">
        <p className="result-context">{applied.purpose === "invitation" ? "청첩장 모임" : "상견례"} 장소</p>
        <div className="result-heading-row">
          <div className="result-summary"><strong>조건 확인 {counts.matched}곳</strong><span>정보 미확인 {counts.unknown}곳 · 총 {counts.total}곳</span></div>
          <div className="result-view-switch" role="group" aria-label="결과 보기 방식">
            <button type="button" className={viewMode === "list" ? "is-selected" : ""} aria-pressed={viewMode === "list"} onClick={() => switchViewMode("list")}>목록</button>
            <button type="button" className={viewMode === "map" ? "is-selected" : ""} aria-pressed={viewMode === "map"} onClick={() => switchViewMode("map")}>지도</button>
          </div>
        </div>
      </div>
      {viewMode === "map" ? (
        <KakaoRestaurantMap
          restaurants={mapRestaurants}
          appKey={kakaoMapAppKey}
          filterKey={queryFromFilters(applied, "map")}
          onBoundsChange={setMapBounds}
        />
      ) : (
        <>
          {loading && matched.length === 0 ? <div className="empty-state"><p>조건에 맞는 장소를 불러오고 있어요.</p></div> : null}
          {loadError ? <div className="empty-state"><h3>장소를 불러오지 못했어요.</h3><p>잠시 후 다시 시도해주세요.</p></div> : null}
          <div className="result-list">{matched.map((item) => <RestaurantCard key={item.restaurant.id} restaurant={item.restaurant} />)}</div>
          {nextOffset !== null ? <button type="button" className="more-button" disabled={loading} onClick={loadMore}>{loading ? "불러오는 중" : "음식점 더 보기"}</button> : null}
          {!loading && counts.matched === 0 ? <div className="empty-state"><h3>조건이 확인된 음식점이 없어요.</h3><p>조건을 하나 줄이거나 정보 미확인 결과를 확인해보세요.</p></div> : null}
          {counts.unknown > 0 ? <details className="unknown-results"><summary>정보 확인이 필요한 음식점 {counts.unknown}곳 보기</summary><p>선택 조건과 다르지는 않지만 필요한 값 일부가 확인되지 않은 곳입니다.</p><div className="result-list">{unknown.map((item) => <RestaurantCard key={item.restaurant.id} restaurant={item.restaurant} unknownReasons={item.unknownReasons} />)}</div>{counts.unknown > unknown.length ? <p>정보 미확인 결과는 처음 {unknown.length}곳만 표시합니다.</p> : null}</details> : null}
        </>
      )}
    </section>
  );
}
