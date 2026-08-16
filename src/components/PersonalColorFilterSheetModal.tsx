"use client";

import { useEffect, useState } from "react";
import { X, Check } from "@phosphor-icons/react";
import type { PersonalColorFilterState, PersonalColorServiceTag } from "@/domain/personal-color-types";
import { PERSONAL_COLOR_SERVICE_TAGS } from "@/domain/personal-color-categories";

const BUDGET_OPTIONS = [
  { label: "전체", value: null },
  { label: "10만원 이하", value: 100000 },
  { label: "15만원 이하", value: 150000 },
  { label: "20만원 이하", value: 200000 },
  { label: "30만원 이하", value: 300000 },
];

export type PersonalColorFilterMode = "all" | "service" | "detail";

interface PersonalColorFilterSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PersonalColorFilterState;
  onApply: (next: PersonalColorFilterState) => void;
  totalMatchesCount: number;
  mode?: PersonalColorFilterMode;
}

export function PersonalColorFilterSheetModal({
  isOpen,
  onClose,
  filters: initialFilters,
  onApply,
  totalMatchesCount,
  mode = "all",
}: PersonalColorFilterSheetModalProps) {
  const [draft, setDraft] = useState<PersonalColorFilterState>(initialFilters);

  useEffect(() => {
    setDraft(initialFilters);
  }, [initialFilters, isOpen]);

  if (!isOpen) return null;

  const toggleServiceTag = (tag: PersonalColorServiceTag) => {
    setDraft((prev) => {
      const exists = prev.serviceTags.includes(tag);
      return {
        ...prev,
        serviceTags: exists
          ? prev.serviceTags.filter((t) => t !== tag)
          : [...prev.serviceTags, tag],
      };
    });
  };

  const handleReset = () => {
    if (mode === "service") {
      setDraft((prev) => ({ ...prev, serviceTags: [] }));
    } else if (mode === "detail") {
      setDraft((prev) => ({
        ...prev,
        priceBudgetMax: null,
      }));
    } else {
      setDraft({
        ...initialFilters,
        serviceTags: [],
        priceBudgetMax: null,
      });
    }
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const title =
    mode === "service"
      ? "진단 및 특화 서비스 필터"
      : mode === "detail"
      ? "가격 및 상세 필터"
      : "웨딩 컬러진단 필터";

  const showService = mode === "all" || mode === "service";
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
          {/* Service Tags Section */}
          {showService ? (
            <section className="filter-sheet-section">
              <h3>진단 및 특화 서비스</h3>
              <p className="filter-section-desc">원하는 세부 진단 서비스를 다중 선택할 수 있습니다.</p>
              <div className="filter-sheet-grid-tags">
                {PERSONAL_COLOR_SERVICE_TAGS.filter((t) => t.id !== "color").map((item) => {
                  const active = draft.serviceTags.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`filter-service-tag-card ${active ? "is-active" : ""}`}
                      onClick={() => toggleServiceTag(item.id)}
                    >
                      <div className="tag-card-content">
                        <span className="tag-card-title">{item.label}</span>
                        <span className="tag-card-desc">{item.description}</span>
                      </div>
                      <div className={`tag-checkbox ${active ? "is-checked" : ""}`}>
                        {active ? <Check size={14} weight="bold" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Budget Filter Section */}
          {showDetail ? (
            <section className="filter-sheet-section">
              <h3>예상 예산 (1인 기준)</h3>
              <div className="filter-sheet-btn-group">
                {BUDGET_OPTIONS.map((opt) => {
                  const active = draft.priceBudgetMax === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      className={`filter-group-btn ${active ? "is-active" : ""}`}
                      onClick={() => setDraft((prev) => ({ ...prev, priceBudgetMax: opt.value }))}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        <footer className="filter-sheet-footer">
          <button type="button" className="filter-sheet-apply-btn" onClick={handleApply}>
            {totalMatchesCount}개 업체 결과 보기
          </button>
        </footer>
      </div>
    </div>
  );
}
