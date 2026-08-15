"use client";

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import type { GatheringPurpose, RestaurantFilterState, Weekday } from "@/domain/restaurant-types";
import { RESTAURANT_CUISINE_CATEGORIES } from "@/domain/restaurant-cuisine";
import type { RestaurantCuisineCategory } from "@/domain/restaurant-cuisine";

export type RestaurantFilterMode = "all" | "cuisine" | "detail";

const WEEKDAYS: Array<{ value: Weekday; label: string }> = [
  { value: "mon", label: "월요일" },
  { value: "tue", label: "화요일" },
  { value: "wed", label: "수요일" },
  { value: "thu", label: "목요일" },
  { value: "fri", label: "금요일" },
  { value: "sat", label: "토요일" },
  { value: "sun", label: "일요일" },
];

const BUDGETS = [30000, 50000, 70000, 100000, 150000, 200000];

interface RestaurantFilterSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: RestaurantFilterState;
  onApply: (next: RestaurantFilterState) => void;
  totalMatchesCount: number;
  mode?: RestaurantFilterMode;
}

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function RestaurantFilterSheetModal({
  isOpen,
  onClose,
  filters: initialFilters,
  onApply,
  totalMatchesCount,
  mode = "all",
}: RestaurantFilterSheetModalProps) {
  const [draft, setDraft] = useState<RestaurantFilterState>(initialFilters);

  useEffect(() => {
    setDraft(initialFilters);
  }, [initialFilters, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    if (mode === "cuisine") {
      setDraft((prev) => ({ ...prev, cuisines: [] }));
    } else if (mode === "detail") {
      setDraft((prev) => ({
        ...prev,
        weekday: null,
        budgetMax: null,
        partySize: null,
        courseOnly: false,
        privateRoomOnly: false,
        parkingOnly: false,
      }));
    } else {
      setDraft({
        ...initialFilters,
        cuisines: [],
        weekday: null,
        budgetMax: null,
        partySize: null,
        courseOnly: false,
        privateRoomOnly: false,
        parkingOnly: false,
      });
    }
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const title =
    mode === "cuisine" ? "음식 종류 필터" : mode === "detail" ? "상세 조건 필터" : "모임 장소 전체 필터";

  const showCuisine = mode === "all" || mode === "cuisine";
  const showDetail = mode === "all" || mode === "detail";

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
          {/* 음식 종류 */}
          {showCuisine ? (
            <section className="filter-section">
              <h3>음식 카테고리</h3>
              <div className="filter-chip-grid">
                {RESTAURANT_CUISINE_CATEGORIES.map((cuisine) => {
                  const isSelected = draft.cuisines.includes(cuisine);
                  return (
                    <button
                      key={cuisine}
                      type="button"
                      className={`filter-pill-btn${isSelected ? " is-selected" : ""}`}
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          cuisines: toggleValue(prev.cuisines, cuisine),
                        }))
                      }
                    >
                      {cuisine}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {showDetail ? (
            <>
              {/* 방문 요일 */}
              <section className="filter-section">
                <h3>방문 요일</h3>
                <div className="filter-chip-grid">
                  {WEEKDAYS.map((day) => {
                    const isSelected = draft.weekday === day.value;
                    return (
                      <button
                        key={day.value}
                        type="button"
                        className={`filter-pill-btn${isSelected ? " is-selected" : ""}`}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            weekday: isSelected ? null : day.value,
                          }))
                        }
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 1인 최대 예산 */}
              <section className="filter-section">
                <h3>1인 최대 예산</h3>
                <div className="filter-chip-grid">
                  {BUDGETS.map((budget) => {
                    const isSelected = draft.budgetMax === budget;
                    return (
                      <button
                        key={budget}
                        type="button"
                        className={`filter-pill-btn${isSelected ? " is-selected" : ""}`}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            budgetMax: isSelected ? null : budget,
                          }))
                        }
                      >
                        {(budget / 10000).toLocaleString("ko-KR")}만원 이하
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 모임 조건 (프라이빗 룸, 코스, 주차) */}
              <section className="filter-section">
                <h3>필수 조건</h3>
                <div className="filter-chip-grid">
                  <button
                    type="button"
                    className={`filter-pill-btn${draft.privateRoomOnly ? " is-selected" : ""}`}
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, privateRoomOnly: !prev.privateRoomOnly }))
                    }
                  >
                    프라이빗 룸 필수
                  </button>

                  <button
                    type="button"
                    className={`filter-pill-btn${draft.courseOnly ? " is-selected" : ""}`}
                    onClick={() => setDraft((prev) => ({ ...prev, courseOnly: !prev.courseOnly }))}
                  >
                    코스 요리 가능
                  </button>

                  <button
                    type="button"
                    className={`filter-pill-btn${draft.parkingOnly ? " is-selected" : ""}`}
                    onClick={() => setDraft((prev) => ({ ...prev, parkingOnly: !prev.parkingOnly }))}
                  >
                    주차 가능
                  </button>
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
