import type {
  FilteredPersonalColor,
  FilterPersonalColorsResult,
  PersonalColorFilterState,
  PersonalColorRecord,
} from "./personal-color-types";

export const EMPTY_PERSONAL_COLOR_FILTERS: PersonalColorFilterState = {
  keyword: "",
  sido: "",
  district: "",
  serviceTags: [],
  priceBudgetMax: null,
  gradeAOnly: false,
  includeOnHold: false,
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

export function filterPersonalColors(
  vendors: PersonalColorRecord[],
  filters: PersonalColorFilterState,
): FilterPersonalColorsResult {
  const matched: FilteredPersonalColor[] = [];
  const unknown: FilteredPersonalColor[] = [];

  const rawKeyword = filters.keyword.trim();
  const normalizedKeyword = normalizeText(rawKeyword);

  for (const vendor of vendors) {
    // 1. On hold check
    if (!filters.includeOnHold && vendor.status === "on_hold") {
      continue;
    }

    // 2. Keyword check
    if (normalizedKeyword) {
      const searchTarget = normalizeText(
        `${vendor.name} ${vendor.sido} ${vendor.sigungu} ${vendor.district} ${vendor.address} ${vendor.evidence} ${vendor.services.join(" ")} ${vendor.notes ?? ""}`
      );
      if (!searchTarget.includes(normalizedKeyword)) {
        continue;
      }
    }

    // 3. Sido check
    if (filters.sido && vendor.sido !== filters.sido) {
      continue;
    }

    // 4. District check
    if (filters.district && !vendor.district.includes(filters.district) && !vendor.sigungu.includes(filters.district)) {
      continue;
    }

    // 5. Service Tags check
    if (filters.serviceTags.length > 0) {
      const hasAllTags = filters.serviceTags.every((tag) => vendor.serviceTags.includes(tag));
      if (!hasAllTags) {
        continue;
      }
    }

    // 6. Grade A only check
    if (filters.gradeAOnly && vendor.grade !== "A") {
      continue;
    }

    // 7. Budget / Price check
    const unknownReasons: string[] = [];
    if (filters.priceBudgetMax !== null) {
      if (vendor.priceEstimatedMin === null) {
        unknownReasons.push("가격 문의 대상");
      } else if (vendor.priceEstimatedMin > filters.priceBudgetMax) {
        continue;
      }
    }

    if (unknownReasons.length > 0) {
      unknown.push({ vendor, state: "unknown", unknownReasons });
    } else {
      matched.push({ vendor, state: "match", unknownReasons: [] });
    }
  }

  return { matched, unknown };
}
