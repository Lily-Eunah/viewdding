"use client";

import { useMemo, useState } from "react";
import { X } from "@phosphor-icons/react";
import { REGION_DEFINITIONS, shortSidoLabel, SIDO_OPTIONS } from "@/domain/regions";
import type { Sido } from "@/domain/types";

const REGION_BY_CODE = new Map(REGION_DEFINITIONS.map((r) => [r.regionCode, r]));

interface RegionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSidos: Sido[];
  selectedRegionCodes: string[];
  selectedDistricts?: string[];
  onApply: (sidos: Sido[], regionCodes: string[], districts: string[]) => void;
  title?: string;
}

export function RegionPickerModal({
  isOpen,
  onClose,
  selectedSidos: initialSidos,
  selectedRegionCodes: initialRegionCodes,
  selectedDistricts: initialDistricts = [],
  onApply,
  title = "지역 선택",
}: RegionPickerModalProps) {
  const [activeSido, setActiveSido] = useState<Sido>(initialSidos[0] ?? "서울특별시");
  const [draftSidos, setDraftSidos] = useState<Sido[]>(initialSidos);
  const [draftRegionCodes, setDraftRegionCodes] = useState<string[]>(initialRegionCodes);
  const [draftDistricts, setDraftDistricts] = useState<string[]>(initialDistricts);

  const sigungusForActiveSido = useMemo(() => {
    return REGION_DEFINITIONS.filter((r) => r.sido === activeSido);
  }, [activeSido]);

  if (!isOpen) return null;

  const isWholeSidoSelected = draftSidos.includes(activeSido);

  const toggleWholeSido = () => {
    if (isWholeSidoSelected) {
      setDraftSidos((prev) => prev.filter((s) => s !== activeSido));
    } else {
      setDraftSidos((prev) => [...prev, activeSido]);
      const currentSidoCodes = new Set(sigungusForActiveSido.map((r) => r.regionCode));
      setDraftRegionCodes((prev) => prev.filter((code) => !currentSidoCodes.has(code)));
      const currentSidoDistricts = new Set(sigungusForActiveSido.map((r) => r.sigungu));
      setDraftDistricts((prev) => prev.filter((d) => !currentSidoDistricts.has(d)));
    }
  };

  const toggleRegionCode = (regionCode: string, sigungu: string) => {
    if (isWholeSidoSelected) {
      setDraftSidos((prev) => prev.filter((s) => s !== activeSido));
    }

    if (draftRegionCodes.includes(regionCode)) {
      setDraftRegionCodes((prev) => prev.filter((c) => c !== regionCode));
    } else {
      setDraftRegionCodes((prev) => [...prev, regionCode]);
    }

    if (draftDistricts.includes(sigungu)) {
      setDraftDistricts((prev) => prev.filter((d) => d !== sigungu));
    } else {
      setDraftDistricts((prev) => [...prev, sigungu]);
    }
  };

  const removeSidoTag = (sido: Sido) => {
    setDraftSidos((prev) => prev.filter((s) => s !== sido));
  };

  const removeRegionCodeTag = (regionCode: string, sigungu: string) => {
    setDraftRegionCodes((prev) => prev.filter((c) => c !== regionCode));
    setDraftDistricts((prev) => prev.filter((d) => d !== sigungu));
  };

  const removeDistrictTag = (district: string) => {
    setDraftDistricts((prev) => prev.filter((d) => d !== district));
    const matchingCodes = new Set(REGION_DEFINITIONS.filter((r) => r.sigungu === district).map((r) => r.regionCode));
    setDraftRegionCodes((prev) => prev.filter((c) => !matchingCodes.has(c)));
  };

  const handleReset = () => {
    setDraftSidos([]);
    setDraftRegionCodes([]);
    setDraftDistricts([]);
  };

  const handleDone = () => {
    onApply(draftSidos, draftRegionCodes, draftDistricts);
    onClose();
  };

  const selectedTags: Array<{ id: string; label: string; onRemove: () => void }> = [];

  draftSidos.forEach((sido) => {
    selectedTags.push({
      id: `sido:${sido}`,
      label: `${shortSidoLabel(sido)} 전체`,
      onRemove: () => removeSidoTag(sido),
    });
  });

  draftRegionCodes.forEach((code) => {
    const region = REGION_BY_CODE.get(code);
    if (region && !draftSidos.includes(region.sido)) {
      selectedTags.push({
        id: `code:${code}`,
        label: `${shortSidoLabel(region.sido)} ${region.sigungu}`,
        onRemove: () => removeRegionCodeTag(code, region.sigungu),
      });
    }
  });

  draftDistricts.forEach((district) => {
    const isCoveredByCode = draftRegionCodes.some((code) => REGION_BY_CODE.get(code)?.sigungu === district);
    const isCoveredBySido = draftSidos.some((sido) => REGION_DEFINITIONS.some((r) => r.sido === sido && r.sigungu === district));
    if (!isCoveredByCode && !isCoveredBySido) {
      selectedTags.push({
        id: `district:${district}`,
        label: district,
        onRemove: () => removeDistrictTag(district),
      });
    }
  });

  return (
    <div className="region-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="region-modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="region-modal-header">
          <h2>{title}</h2>
          <button type="button" className="region-modal-close" onClick={onClose} aria-label="닫기">
            <X size={20} weight="bold" />
          </button>
        </header>

        <div className="region-modal-body">
          {/* Left Column: Sidos */}
          <nav className="region-modal-sido-list">
            {SIDO_OPTIONS.map(({ value, shortLabel }) => {
              const isActive = value === activeSido;
              const hasSelection = draftSidos.includes(value) ||
                draftRegionCodes.some((c) => REGION_BY_CODE.get(c)?.sido === value);
              return (
                <button
                  key={value}
                  type="button"
                  className={`region-sido-item${isActive ? " is-active" : ""}${hasSelection ? " has-selected" : ""}`}
                  onClick={() => setActiveSido(value)}
                >
                  <span>{shortLabel}</span>
                  {hasSelection ? <span className="sido-selection-dot" /> : null}
                </button>
              );
            })}
          </nav>

          {/* Right Column: Sub-regions */}
          <div className="region-modal-subregion-list">
            <button
              type="button"
              className={`region-subregion-item${isWholeSidoSelected ? " is-selected" : ""}`}
              onClick={toggleWholeSido}
            >
              <span>전체</span>
            </button>

            {sigungusForActiveSido.map((region) => {
              const isCodeSelected = draftRegionCodes.includes(region.regionCode);
              const isDistrictSelected = draftDistricts.includes(region.sigungu);
              const isSelected = isWholeSidoSelected || isCodeSelected || isDistrictSelected;

              return (
                <button
                  key={region.regionCode}
                  type="button"
                  className={`region-subregion-item${isSelected ? " is-selected" : ""}`}
                  onClick={() => toggleRegionCode(region.regionCode, region.sigungu)}
                >
                  <span>{region.sigungu}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Tags Summary */}
        {selectedTags.length > 0 ? (
          <div className="region-modal-tags-bar">
            <div className="region-modal-tags-scroll">
              {selectedTags.map((tag) => (
                <span key={tag.id} className="region-modal-tag">
                  {tag.label}
                  <button type="button" onClick={tag.onRemove} aria-label={`${tag.label} 삭제`}>
                    <X size={12} weight="bold" />
                  </button>
                </span>
              ))}
            </div>
            <button type="button" className="region-modal-reset-btn" onClick={handleReset}>
              전체 해제
            </button>
          </div>
        ) : null}

        {/* Sticky Footer */}
        <footer className="region-modal-footer">
          <button type="button" className="region-modal-submit" onClick={handleDone}>
            완료
          </button>
        </footer>
      </div>
    </div>
  );
}
