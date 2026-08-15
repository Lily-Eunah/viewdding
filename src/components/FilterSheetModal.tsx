"use client";

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import type { CeremonyFormat, FilterState, HallTypeFilter, MealType } from "@/domain/types";
import { CEREMONY_OPTIONS, HALL_TYPE_GROUPS, INTERVAL_OPTIONS, MEAL_OPTIONS } from "@/lib/labels";

export type FilterModalMode = "all" | "hallType" | "detail";

interface FilterSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (next: FilterState) => void;
  totalMatchesCount: number;
  mode?: FilterModalMode;
}

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function FilterSheetModal({
  isOpen,
  onClose,
  filters: initialFilters,
  onApply,
  totalMatchesCount,
  mode = "all",
}: FilterSheetModalProps) {
  const [draft, setDraft] = useState<FilterState>(initialFilters);

  useEffect(() => {
    setDraft(initialFilters);
  }, [initialFilters, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    if (mode === "hallType") {
      setDraft((prev) => ({ ...prev, hallTypes: [] }));
    } else if (mode === "detail") {
      setDraft((prev) => ({
        ...prev,
        guests: null,
        naturalLight: false,
        ceremonyFormats: [],
        intervalAtLeast: null,
        meals: [],
      }));
    } else {
      setDraft({
        ...initialFilters,
        hallTypes: [],
        guests: null,
        naturalLight: false,
        ceremonyFormats: [],
        intervalAtLeast: null,
        meals: [],
      });
    }
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const title =
    mode === "hallType" ? "홀 타입 필터" : mode === "detail" ? "상세 조건 필터" : "웨딩홀 전체 필터";

  const showHallTypes = mode === "all" || mode === "hallType";
  const showDetails = mode === "all" || mode === "detail";

  return (
    <div className="filter-sheet-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="filter-sheet-container" onClick={(e) => e.stopPropagation()}>
        <header className="filter-sheet-header">
          <h2>{title}</h2>
          <div className="filter-sheet-header-right">
            <button type="button" className="filter-sheet-reset-btn" onClick={handleReset}>
              초기화
            </button>
            <button type="button" className="filter-sheet-close" onClick={onClose} aria-label="닫기">
              <X size={20} weight="bold" />
            </button>
          </div>
        </header>

        <div className="filter-sheet-body">
          {/* 스타일 / 웨딩홀 타입 */}
          {showHallTypes ? (
            <section className="filter-section">
              <h3>홀 스타일</h3>
              <div className="filter-chip-grid">
                {HALL_TYPE_GROUPS.flatMap((group) => group.options).map((option) => {
                  const isSelected = draft.hallTypes.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`filter-pill-btn${isSelected ? " is-selected" : ""}`}
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          hallTypes: toggleValue(prev.hallTypes, option.value),
                        }))
                      }
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {showDetails ? (
            <>
              {/* 예상 하객 수 */}
              <section className="filter-section">
                <h3>예상 하객 수</h3>
                <div className="guest-input-row">
                  <input
                    type="number"
                    className="guest-count-input"
                    placeholder="하객 수 입력 (예: 200)"
                    value={draft.guests ?? ""}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      setDraft((prev) => ({ ...prev, guests: val }));
                    }}
                  />
                  <span className="guest-unit">명</span>
                </div>
              </section>

              {/* 채광 */}
              <section className="filter-section">
                <h3>채광</h3>
                <div className="filter-chip-grid">
                  <button
                    type="button"
                    className={`filter-pill-btn${draft.naturalLight ? " is-selected" : ""}`}
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, naturalLight: !prev.naturalLight }))
                    }
                  >
                    자연광 있음
                  </button>
                </div>
              </section>

              {/* 예식 형태 */}
              <section className="filter-section">
                <h3>예식 형태</h3>
                <div className="filter-chip-grid">
                  {CEREMONY_OPTIONS.map((option) => {
                    const isSelected = draft.ceremonyFormats.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`filter-pill-btn${isSelected ? " is-selected" : ""}`}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            ceremonyFormats: toggleValue(prev.ceremonyFormats, option.value),
                          }))
                        }
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 예식 간격 */}
              <section className="filter-section">
                <h3>예식 간격</h3>
                <div className="filter-chip-grid">
                  {INTERVAL_OPTIONS.map((interval) => {
                    const isSelected = draft.intervalAtLeast === interval;
                    return (
                      <button
                        key={interval}
                        type="button"
                        className={`filter-pill-btn${isSelected ? " is-selected" : ""}`}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            intervalAtLeast: isSelected ? null : interval,
                          }))
                        }
                      >
                        {interval}분 이상
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 식사 종류 */}
              <section className="filter-section">
                <h3>식사 종류</h3>
                <div className="filter-chip-grid">
                  {MEAL_OPTIONS.map((option) => {
                    const isSelected = draft.meals.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`filter-pill-btn${isSelected ? " is-selected" : ""}`}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            meals: toggleValue(prev.meals, option.value),
                          }))
                        }
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          ) : null}
        </div>

        {/* Sticky Footer Action Button */}
        <footer className="filter-sheet-footer">
          <button type="button" className="filter-sheet-submit-btn" onClick={handleApply}>
            적용 ({totalMatchesCount}개 결과)
          </button>
        </footer>
      </div>
    </div>
  );
}
