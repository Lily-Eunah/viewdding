"use client";

import { useEffect, useMemo, useState } from "react";
import { EMPTY_RESTAURANT_FILTERS, filterRestaurants } from "@/domain/restaurant-filter";
import type { GatheringPurpose, RestaurantFilterState, RestaurantRecord, Weekday } from "@/domain/restaurant-types";
import { KakaoRestaurantMap } from "./KakaoRestaurantMap";
import { RestaurantCard } from "./RestaurantCard";

const WEEKDAYS: Array<{ value: Weekday; label: string }> = [
  { value: "mon", label: "월요일" }, { value: "tue", label: "화요일" },
  { value: "wed", label: "수요일" }, { value: "thu", label: "목요일" },
  { value: "fri", label: "금요일" }, { value: "sat", label: "토요일" },
  { value: "sun", label: "일요일" },
];
const BUDGETS = [30000, 50000, 70000, 100000, 150000, 200000];

function purposeFrom(value: string | null): GatheringPurpose {
  return value === "family_meeting" ? "family_meeting" : "invitation";
}

function queryFromFilters(filters: RestaurantFilterState): string {
  const params = new URLSearchParams();
  params.set("purpose", filters.purpose);
  if (filters.district) params.set("district", filters.district);
  if (filters.area) params.set("area", filters.area);
  if (filters.weekday) params.set("weekday", filters.weekday);
  if (filters.cuisines.length > 0) params.set("cuisines", filters.cuisines.join(","));
  if (filters.budgetMax !== null) params.set("budget", String(filters.budgetMax));
  if (filters.partySize !== null) params.set("people", String(filters.partySize));
  if (filters.courseOnly) params.set("course", "1");
  if (filters.privateRoomOnly) params.set("room", "1");
  if (filters.parkingOnly) params.set("parking", "1");
  return params.toString();
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function RestaurantSearchExperience({
  restaurants,
  kakaoMapAppKey,
}: {
  restaurants: RestaurantRecord[];
  kakaoMapAppKey: string;
}) {
  const [draft, setDraft] = useState<RestaurantFilterState>({ ...EMPTY_RESTAURANT_FILTERS });
  const [applied, setApplied] = useState<RestaurantFilterState>({ ...EMPTY_RESTAURANT_FILTERS });
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed: RestaurantFilterState = {
      purpose: purposeFrom(params.get("purpose")),
      district: params.get("district") ?? "",
      area: params.get("area") ?? "",
      weekday: (params.get("weekday") as Weekday | null) ?? null,
      cuisines: params.get("cuisines")?.split(",").filter(Boolean) ?? [],
      budgetMax: params.get("budget") ? Number(params.get("budget")) : null,
      partySize: params.get("people") ? Number(params.get("people")) : null,
      courseOnly: params.get("course") === "1",
      privateRoomOnly: params.get("room") === "1",
      parkingOnly: params.get("parking") === "1",
    };
    setDraft(parsed);
    setApplied(parsed);
    if (parsed.weekday || parsed.cuisines.length || parsed.budgetMax || parsed.partySize || parsed.courseOnly || parsed.privateRoomOnly || parsed.parkingOnly) setDetailOpen(true);
  }, []);

  const purposeRestaurants = useMemo(
    () => restaurants.filter((restaurant) => restaurant.purpose === draft.purpose),
    [draft.purpose, restaurants],
  );
  const districts = useMemo(
    () => Array.from(new Set(purposeRestaurants.map((restaurant) => restaurant.district))).sort((a, b) => a.localeCompare(b, "ko")),
    [purposeRestaurants],
  );
  const areas = useMemo(
    () => Array.from(new Set(purposeRestaurants.flatMap((restaurant) => [restaurant.area, restaurant.nearestStation]).filter((item): item is string => Boolean(item)))).sort((a, b) => a.localeCompare(b, "ko")),
    [purposeRestaurants],
  );
  const cuisines = useMemo(
    () => Array.from(new Set(purposeRestaurants.flatMap((restaurant) => restaurant.cuisines))).sort((a, b) => a.localeCompare(b, "ko")),
    [purposeRestaurants],
  );
  const results = useMemo(() => filterRestaurants(restaurants, applied), [applied, restaurants]);
  const total = results.matched.length + results.unknown.length;

  function replaceUrl(filters: RestaurantFilterState) {
    window.history.replaceState(null, "", `${window.location.pathname}?${queryFromFilters(filters)}`);
  }

  function switchPurpose(purpose: GatheringPurpose) {
    const next = { ...draft, purpose, district: "", area: "", cuisines: [] };
    setDraft(next);
    setApplied(next);
    replaceUrl(next);
  }

  function commit(next: RestaurantFilterState) {
    setDraft(next);
    setApplied(next);
    replaceUrl(next);
  }

  const selectedCount = Number(draft.weekday !== null) + draft.cuisines.length + Number(draft.budgetMax !== null)
    + Number(draft.partySize !== null) + Number(draft.courseOnly) + Number(draft.privateRoomOnly) + Number(draft.parkingOnly);

  return (
    <section className="restaurant-search-experience">
      <div className="purpose-toggle" role="radiogroup" aria-label="모임 종류">
        <button type="button" role="radio" aria-checked={draft.purpose === "invitation"} className={draft.purpose === "invitation" ? "is-selected" : ""} onClick={() => switchPurpose("invitation")}>청첩장 모임</button>
        <button type="button" role="radio" aria-checked={draft.purpose === "family_meeting"} className={draft.purpose === "family_meeting" ? "is-selected" : ""} onClick={() => switchPurpose("family_meeting")}>상견례</button>
      </div>

      <form className="search-panel" onSubmit={(event) => { event.preventDefault(); commit(draft); document.getElementById("restaurant-results")?.scrollIntoView({ behavior: "smooth" }); }}>
        <div className="restaurant-filter-grid">
          <label className="field-label"><span>서울 구</span><select value={draft.district} onChange={(event) => setDraft({ ...draft, district: event.target.value })}><option value="">서울 전체</option>{districts.map((district) => <option key={district}>{district}</option>)}</select></label>
          <label className="field-label"><span>동네·역</span><select value={draft.area} onChange={(event) => setDraft({ ...draft, area: event.target.value })}><option value="">전체</option>{areas.map((area) => <option key={area}>{area}</option>)}</select></label>
          <label className="field-label"><span>방문 요일</span><select value={draft.weekday ?? ""} onChange={(event) => setDraft({ ...draft, weekday: (event.target.value || null) as Weekday | null })}><option value="">요일 전체</option>{WEEKDAYS.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}</select></label>
          <button className="search-button" type="submit">찾기</button>
        </div>

        <button className="detail-toggle" type="button" aria-expanded={detailOpen} onClick={() => setDetailOpen(!detailOpen)}>{detailOpen ? "−" : "+"} 상세 조건{selectedCount ? ` ${selectedCount}` : ""}</button>
        {detailOpen ? <div className="restaurant-detail-panel">
          <fieldset className="restaurant-cuisine-field"><legend>음식</legend><div className="option-row">{cuisines.map((cuisine) => <button key={cuisine} type="button" className={draft.cuisines.includes(cuisine) ? "option is-selected" : "option"} aria-pressed={draft.cuisines.includes(cuisine)} onClick={() => setDraft({ ...draft, cuisines: toggleValue(draft.cuisines, cuisine) })}>{cuisine}</button>)}</div></fieldset>
          <label className="field-label"><span>1인 최대 예산</span><select value={draft.budgetMax ?? ""} onChange={(event) => setDraft({ ...draft, budgetMax: event.target.value ? Number(event.target.value) : null })}><option value="">가격 전체</option>{BUDGETS.map((budget) => <option key={budget} value={budget}>{budget.toLocaleString("ko-KR")}원</option>)}</select></label>
          <label className="field-label"><span>룸 이용 인원</span><input type="number" min="1" placeholder="예: 6" value={draft.partySize ?? ""} onChange={(event) => setDraft({ ...draft, partySize: event.target.value ? Number(event.target.value) : null })} /></label>
          <fieldset className="restaurant-boolean-filters"><legend>필수 조건</legend><div className="option-row">
            <button type="button" className={draft.courseOnly ? "option is-selected" : "option"} aria-pressed={draft.courseOnly} onClick={() => setDraft({ ...draft, courseOnly: !draft.courseOnly })}>코스 가능</button>
            <button type="button" className={draft.privateRoomOnly ? "option is-selected" : "option"} aria-pressed={draft.privateRoomOnly} onClick={() => setDraft({ ...draft, privateRoomOnly: !draft.privateRoomOnly })}>룸 있음</button>
            <button type="button" className={draft.parkingOnly ? "option is-selected" : "option"} aria-pressed={draft.parkingOnly} onClick={() => setDraft({ ...draft, parkingOnly: !draft.parkingOnly })}>주차 가능</button>
          </div></fieldset>
          <p className="missing-policy">선택한 요일이 정기 휴무인 음식점은 제외합니다. 휴무일을 확인하지 못한 곳은 ‘정보 확인 필요’로 분리합니다.</p>
        </div> : null}
      </form>

      <div id="restaurant-results" className="results-heading">
        <p className="result-context">{applied.purpose === "invitation" ? "청첩장 모임" : "상견례"} 장소</p>
        <div className="result-heading-row">
          <div className="result-summary"><strong>조건 확인 {results.matched.length}곳</strong><span>정보 미확인 {results.unknown.length}곳 · 총 {total}곳</span></div>
          <div className="result-view-switch" role="group" aria-label="결과 보기 방식">
            <button type="button" className={viewMode === "list" ? "is-selected" : ""} aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}>목록</button>
            <button type="button" className={viewMode === "map" ? "is-selected" : ""} aria-pressed={viewMode === "map"} onClick={() => setViewMode("map")}>지도</button>
          </div>
        </div>
      </div>
      {viewMode === "map" ? (
        <KakaoRestaurantMap
          restaurants={[...results.matched, ...results.unknown].map((item) => item.restaurant)}
          appKey={kakaoMapAppKey}
        />
      ) : (
        <>
          <div className="result-list">{results.matched.map((item) => <RestaurantCard key={item.restaurant.id} restaurant={item.restaurant} />)}</div>
          {results.matched.length === 0 ? <div className="empty-state"><h3>조건이 확인된 음식점이 없어요.</h3><p>조건을 하나 줄이거나 정보 미확인 결과를 확인해보세요.</p></div> : null}
          {results.unknown.length > 0 ? <details className="unknown-results"><summary>정보 확인이 필요한 음식점 {results.unknown.length}곳 보기</summary><p>선택 조건과 다르지는 않지만 필요한 값 일부가 확인되지 않은 곳입니다.</p><div className="result-list">{results.unknown.map((item) => <RestaurantCard key={item.restaurant.id} restaurant={item.restaurant} unknownReasons={item.unknownReasons} />)}</div></details> : null}
        </>
      )}
    </section>
  );
}
