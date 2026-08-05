"use client";

import { useEffect, useMemo, useState } from "react";
import { EMPTY_FILTERS, filterHalls } from "@/domain/filter";
import type { CeremonyFormat, FilterState, HallTypeFilter, MealType } from "@/domain/types";
import { districts, halls } from "@/lib/data";
import { CEREMONY_OPTIONS, HALL_TYPE_GROUPS, INTERVAL_OPTIONS, MEAL_OPTIONS, hallTypeLabel } from "@/lib/labels";
import { HallCard } from "./HallCard";

const PAGE_SIZE = 24;

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function typeSummary(types: HallTypeFilter[]): string {
  if (types.length === 0) return "웨딩홀 타입";
  if (types.length <= 2) return types.map(hallTypeLabel).join(" · ");
  return `${hallTypeLabel(types[0])} 외 ${types.length - 1}개`;
}

function queryFromFilters(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.district) params.set("district", filters.district);
  if (filters.hallTypes.length) params.set("types", filters.hallTypes.join(","));
  if (filters.guests !== null) params.set("guests", String(filters.guests));
  if (filters.naturalLight) params.set("natural", "1");
  if (filters.ceremonyFormats.length) params.set("ceremony", filters.ceremonyFormats.join(","));
  if (filters.intervalAtLeast !== null) params.set("interval", String(filters.intervalAtLeast));
  if (filters.meals.length) params.set("meals", filters.meals.join(","));
  return params.toString();
}

export function SearchExperience({ compact = false }: { compact?: boolean }) {
  const [draft, setDraft] = useState<FilterState>({ ...EMPTY_FILTERS });
  const [applied, setApplied] = useState<FilterState>({ ...EMPTY_FILTERS });
  const [pickerTypes, setPickerTypes] = useState<HallTypeFilter[]>([]);
  const [typeOpen, setTypeOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed: FilterState = {
      district: params.get("district") ?? "",
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
    if (parsed.guests || parsed.naturalLight || parsed.ceremonyFormats.length || parsed.intervalAtLeast || parsed.meals.length) setDetailOpen(true);
  }, []);

  const results = useMemo(() => filterHalls(halls, applied), [applied]);
  useEffect(() => setVisible(PAGE_SIZE), [applied]);

  const detailCount = Number(draft.guests !== null) + Number(draft.naturalLight) + draft.ceremonyFormats.length + Number(draft.intervalAtLeast !== null) + draft.meals.length;
  function commit(next: FilterState) {
    setApplied(next);
    setDraft(next);
    const query = queryFromFilters(next);
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  const chips: Array<{ key: string; label: string; remove: () => void }> = [];
  if (applied.district) chips.push({ key: "district", label: applied.district, remove: () => commit({ ...applied, district: "" }) });
  applied.hallTypes.forEach((type) => chips.push({ key: `type-${type}`, label: hallTypeLabel(type), remove: () => commit({ ...applied, hallTypes: applied.hallTypes.filter((item) => item !== type) }) }));
  if (applied.guests !== null) chips.push({ key: "guests", label: `${applied.guests}명`, remove: () => commit({ ...applied, guests: null }) });
  if (applied.naturalLight) chips.push({ key: "natural", label: "자연광 있음", remove: () => commit({ ...applied, naturalLight: false }) });
  applied.ceremonyFormats.forEach((value) => chips.push({ key: `ceremony-${value}`, label: CEREMONY_OPTIONS.find((option) => option.value === value)?.label ?? value, remove: () => commit({ ...applied, ceremonyFormats: applied.ceremonyFormats.filter((item) => item !== value) }) }));
  if (applied.intervalAtLeast !== null) chips.push({ key: "interval", label: `${applied.intervalAtLeast}분 이상`, remove: () => commit({ ...applied, intervalAtLeast: null }) });
  applied.meals.forEach((value) => chips.push({ key: `meal-${value}`, label: MEAL_OPTIONS.find((option) => option.value === value)?.label ?? value, remove: () => commit({ ...applied, meals: applied.meals.filter((item) => item !== value) }) }));

  return (
    <section className={`search-experience${compact ? " is-compact" : ""}`}>
      <form className="search-panel" onSubmit={(event) => { event.preventDefault(); commit(draft); document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth" }); }}>
        <div className="primary-filter-grid">
          <label className="field-label"><span>서울 구</span><select value={draft.district} onChange={(event) => setDraft({ ...draft, district: event.target.value })}><option value="">서울 전체</option>{districts.map((district) => <option key={district}>{district}</option>)}</select></label>
          <div className="type-picker">
            <span className="field-caption">웨딩홀 타입</span>
            <button className="field-button" type="button" aria-expanded={typeOpen} onClick={() => { setPickerTypes(draft.hallTypes); setTypeOpen(!typeOpen); }}>{typeSummary(draft.hallTypes)}</button>
            {typeOpen ? <div className="type-picker-panel">
              {HALL_TYPE_GROUPS.map((group) => <fieldset key={group.label}><legend>{group.label}</legend><div className="option-row">{group.options.map((option) => <button key={option.value} type="button" className={pickerTypes.includes(option.value) ? "option is-selected" : "option"} aria-pressed={pickerTypes.includes(option.value)} onClick={() => setPickerTypes(toggleValue(pickerTypes, option.value))}>{option.label}</button>)}</div></fieldset>)}
              <button type="button" className="complete-button" onClick={() => { setDraft({ ...draft, hallTypes: pickerTypes }); setTypeOpen(false); }}>선택 완료</button>
            </div> : null}
          </div>
          <button className="search-button" type="submit">찾기</button>
        </div>

        <button className="detail-toggle" type="button" aria-expanded={detailOpen} onClick={() => setDetailOpen(!detailOpen)}>{detailOpen ? "−" : "+"} 상세 조건{detailCount ? ` ${detailCount}` : ""}</button>
        {detailOpen ? <div className="detail-panel">
          <label className="detail-field"><span>예상 하객 수</span><input type="number" min="1" placeholder="예: 200" value={draft.guests ?? ""} onChange={(event) => setDraft({ ...draft, guests: event.target.value ? Number(event.target.value) : null })} /></label>
          <fieldset><legend>자연광</legend><button type="button" className={draft.naturalLight ? "option is-selected" : "option"} aria-pressed={draft.naturalLight} onClick={() => setDraft({ ...draft, naturalLight: !draft.naturalLight })}>자연광 있음</button></fieldset>
          <fieldset><legend>예식 형태</legend><div className="option-row">{CEREMONY_OPTIONS.map((option) => <button key={option.value} type="button" className={draft.ceremonyFormats.includes(option.value) ? "option is-selected" : "option"} onClick={() => setDraft({ ...draft, ceremonyFormats: toggleValue(draft.ceremonyFormats, option.value) })}>{option.label}</button>)}</div></fieldset>
          <fieldset><legend>예식 간격</legend><div className="option-row">{INTERVAL_OPTIONS.map((interval) => <button key={interval} type="button" className={draft.intervalAtLeast === interval ? "option is-selected" : "option"} onClick={() => setDraft({ ...draft, intervalAtLeast: draft.intervalAtLeast === interval ? null : interval })}>{interval}분 이상</button>)}</div></fieldset>
          <fieldset className="detail-wide"><legend>식사 유형</legend><div className="option-row">{MEAL_OPTIONS.map((option) => <button key={option.value} type="button" className={draft.meals.includes(option.value) ? "option is-selected" : "option"} onClick={() => setDraft({ ...draft, meals: toggleValue(draft.meals, option.value) })}>{option.label}</button>)}</div></fieldset>
          <p className="missing-policy">값이 없는 홀은 제외하지 않고 ‘정보 확인이 필요한 홀’로 분리합니다.</p>
        </div> : null}
      </form>

      <div id="search-results" className="results-heading">
        <div className="applied-chips">{chips.map((chip) => <button key={chip.key} type="button" onClick={chip.remove}>{chip.label} ×</button>)}</div>
        <div className="result-summary"><strong>검색 결과 {results.matched.length}개</strong><span>추가 확인이 필요한 홀 {results.unknown.length}개는 아래에 따로 모았어요.</span></div>
      </div>

      <div className="result-list">{results.matched.slice(0, visible).map((item) => <HallCard key={item.hall.id} hall={item.hall} />)}</div>
      {visible < results.matched.length ? <button type="button" className="more-button" onClick={() => setVisible(visible + PAGE_SIZE)}>홀 더 보기</button> : null}
      {results.matched.length === 0 ? <div className="empty-state"><h3>조건이 확인된 홀이 없어요.</h3><p>조건을 하나 줄이거나 정보 미확인 결과를 확인해보세요.</p></div> : null}

      {results.unknown.length > 0 ? <details className="unknown-results"><summary>정보 확인이 필요한 홀 {results.unknown.length}개 보기</summary><p>선택한 조건과 명확히 다르지는 않지만 일부 값이 공개되지 않은 홀입니다.</p><div className="result-list">{results.unknown.slice(0, 24).map((item) => <HallCard key={item.hall.id} hall={item.hall} unknownReasons={item.unknownReasons} />)}</div></details> : null}
    </section>
  );
}
