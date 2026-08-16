"use client";

import { useMemo, useState } from "react";
import { Check, X } from "@phosphor-icons/react";
import {
  MacroRegionCategory,
  RegionBundle,
  REGION_BUNDLE_GROUPS,
  REGION_DEFINITIONS,
} from "@/domain/regions";
import type { Sido } from "@/domain/types";

const ALL_BUNDLES: RegionBundle[] = REGION_BUNDLE_GROUPS.flatMap((g) => g.bundles);
const BUNDLE_BY_ID = new Map(ALL_BUNDLES.map((b) => [b.id, b]));

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
  const [activeMacroId, setActiveMacroId] = useState<string>("capital");

  // Determine initial selected bundles based on passed props
  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>(() => {
    const ids: string[] = [];
    // 1. Check if any whole sido matches
    if (initialSidos.length > 0) {
      for (const bundle of ALL_BUNDLES) {
        if (
          bundle.sigungus.length === 0 &&
          bundle.sidos.length > 0 &&
          bundle.sidos.every((s) => initialSidos.includes(s)) &&
          initialSidos.length === bundle.sidos.length
        ) {
          ids.push(bundle.id);
        }
      }
    }
    // 2. Check if districts match any bundle
    if (initialDistricts.length > 0) {
      for (const bundle of ALL_BUNDLES) {
        if (
          bundle.sigungus.length > 0 &&
          bundle.sigungus.some((sig) => initialDistricts.includes(sig))
        ) {
          if (!ids.includes(bundle.id)) ids.push(bundle.id);
        }
      }
    }
    return ids;
  });

  const activeCategory = useMemo<MacroRegionCategory>(() => {
    return REGION_BUNDLE_GROUPS.find((g) => g.id === activeMacroId) ?? REGION_BUNDLE_GROUPS[1];
  }, [activeMacroId]);

  if (!isOpen) return null;

  const toggleBundle = (bundle: RegionBundle) => {
    if (bundle.id === "all_nation") {
      if (selectedBundleIds.includes("all_nation")) {
        setSelectedBundleIds([]);
      } else {
        setSelectedBundleIds(["all_nation"]);
      }
      return;
    }

    // If selecting specific bundle, deselect all_nation
    let next = selectedBundleIds.filter((id) => id !== "all_nation");

    if (next.includes(bundle.id)) {
      next = next.filter((id) => id !== bundle.id);
    } else {
      next = [...next, bundle.id];
    }
    setSelectedBundleIds(next);
  };

  const removeBundle = (bundleId: string) => {
    setSelectedBundleIds((prev) => prev.filter((id) => id !== bundleId));
  };

  const handleReset = () => {
    setSelectedBundleIds([]);
  };

  const handleDone = () => {
    const selectedBundles = selectedBundleIds
      .map((id) => BUNDLE_BY_ID.get(id))
      .filter((b): b is RegionBundle => Boolean(b));

    if (selectedBundles.length === 0) {
      onApply([], [], []);
      onClose();
      return;
    }

    if (selectedBundleIds.includes("all_nation")) {
      onApply([], [], []);
      onClose();
      return;
    }

    const appliedSidosSet = new Set<Sido>();
    const appliedDistrictsSet = new Set<string>();
    const appliedRegionCodesSet = new Set<string>();

    for (const bundle of selectedBundles) {
      if (bundle.sigungus.length === 0) {
        // Whole sido(s)
        for (const sido of bundle.sidos) {
          appliedSidosSet.add(sido);
        }
      } else {
        // Specific sigungus
        for (const sig of bundle.sigungus) {
          appliedDistrictsSet.add(sig);
        }
        // Match regionCodes from REGION_DEFINITIONS
        const matchingCodes = REGION_DEFINITIONS.filter(
          (r) => bundle.sidos.includes(r.sido) && bundle.sigungus.includes(r.sigungu)
        ).map((r) => r.regionCode);
        for (const code of matchingCodes) {
          appliedRegionCodesSet.add(code);
        }
      }
    }

    onApply(
      Array.from(appliedSidosSet),
      Array.from(appliedRegionCodesSet),
      Array.from(appliedDistrictsSet)
    );
    onClose();
  };

  const selectedBundleObjects = selectedBundleIds
    .map((id) => BUNDLE_BY_ID.get(id))
    .filter((b): b is RegionBundle => Boolean(b));

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
          {/* Left Column: Macro Regions (전국, 수도권, 부산, 대구 등) */}
          <nav className="region-modal-sido-list" aria-label="대권역 목록">
            {REGION_BUNDLE_GROUPS.map((category) => {
              const isActive = category.id === activeMacroId;
              const hasSelection = category.bundles.some((b) => selectedBundleIds.includes(b.id));
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`region-sido-item${isActive ? " is-active" : ""}${hasSelection ? " has-selected" : ""}`}
                  onClick={() => setActiveMacroId(category.id)}
                >
                  <span>{category.name}</span>
                  {hasSelection ? <span className="sido-selection-dot" /> : null}
                </button>
              );
            })}
          </nav>

          {/* Right Column: CatchTable-style Region Bundles */}
          <div className="region-modal-subregion-list" aria-label="권역 묶음 목록">
            {activeCategory.bundles.map((bundle) => {
              const isSelected = selectedBundleIds.includes(bundle.id);
              return (
                <button
                  key={bundle.id}
                  type="button"
                  className={`region-subregion-item${isSelected ? " is-selected" : ""}`}
                  onClick={() => toggleBundle(bundle)}
                >
                  <span>{bundle.label}</span>
                  {isSelected ? <Check size={14} weight="bold" className="bundle-check-icon" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Tags Bar */}
        {selectedBundleObjects.length > 0 ? (
          <div className="region-modal-tags-bar">
            <div className="region-modal-tags-scroll">
              {selectedBundleObjects.map((bundle) => (
                <span key={bundle.id} className="region-modal-tag">
                  {bundle.label}
                  <button type="button" onClick={() => removeBundle(bundle.id)} aria-label={`${bundle.label} 삭제`}>
                    <X size={12} weight="bold" />
                  </button>
                </span>
              ))}
            </div>
            <button type="button" className="region-modal-reset-btn" onClick={handleReset}>
              초기화
            </button>
          </div>
        ) : null}

        {/* Sticky Footer */}
        <footer className="region-modal-footer">
          <button type="button" className="region-modal-submit" onClick={handleDone}>
            관심지역 설정 완료
          </button>
        </footer>
      </div>
    </div>
  );
}

