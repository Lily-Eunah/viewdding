import type {
  CeremonyFormat,
  FilterState,
  FilteredHall,
  HallRecord,
  HallTypeFilter,
  MatchState,
  MealType,
} from "./types";

const TYPE_GROUPS: HallTypeFilter[][] = [
  ["bright", "dark"],
  ["chapel", "house", "outdoor"],
  ["hotel", "professional", "public"],
];

function combine(states: MatchState[]): MatchState {
  if (states.includes("match")) return "match";
  if (states.includes("unknown")) return "unknown";
  return "mismatch";
}

function matchType(hall: HallRecord, type: HallTypeFilter): MatchState {
  switch (type) {
    case "bright":
      return hall.lighting === "bright" || hall.lighting === "transitional"
        ? "match"
        : hall.lighting === "unknown" ? "unknown" : "mismatch";
    case "dark":
      return hall.lighting === "dark" || hall.lighting === "transitional"
        ? "match"
        : hall.lighting === "unknown" ? "unknown" : "mismatch";
    case "chapel":
      return hall.chapel === true ? "match" : hall.chapel === null ? "unknown" : "mismatch";
    case "house":
      return hall.house === true ? "match" : hall.house === null ? "unknown" : "mismatch";
    case "outdoor":
      return hall.indoorOutdoor === "outdoor" || hall.indoorOutdoor === "both"
        ? "match"
        : hall.indoorOutdoor === "unknown" ? "unknown" : "mismatch";
    case "hotel":
      return hall.venueType === "hotel" ? "match" : hall.venueType === "unknown" ? "unknown" : "mismatch";
    case "professional":
      return hall.venueType === "professional_convention"
        ? "match"
        : hall.venueType === "unknown" ? "unknown" : "mismatch";
    case "public":
      return hall.venueType === "public" ? "match" : hall.venueType === "unknown" ? "unknown" : "mismatch";
  }
}

function matchGuests(hall: HallRecord, guests: number): MatchState {
  if (hall.capacity.max !== null && guests > hall.capacity.max) return "mismatch";
  if (hall.guarantee.min !== null && guests < hall.guarantee.min) return "mismatch";
  if (hall.capacity.max === null || hall.guarantee.min === null) return "unknown";
  if (
    hall.guarantee.max !== null &&
    hall.guarantee.max !== hall.guarantee.min &&
    guests < hall.guarantee.max
  ) return "unknown";
  return "match";
}

function matchCeremony(hall: HallRecord, selected: Exclude<CeremonyFormat, "unknown">[]): MatchState {
  if (hall.ceremonyFormat === "unknown") return "unknown";
  return selected.some((value) => {
    if (hall.ceremonyFormat === "selectable") return true;
    return hall.ceremonyFormat === value;
  }) ? "match" : "mismatch";
}

function matchInterval(hall: HallRecord, threshold: number): MatchState {
  const { min, max } = hall.interval;
  if (min === null || max === null) return "unknown";
  if (min >= threshold) return "match";
  if (max < threshold) return "mismatch";
  return "unknown";
}

function matchMeals(hall: HallRecord, selected: MealType[]): MatchState {
  if (hall.meals.length === 0) return "unknown";
  return selected.some((meal) => hall.meals.includes(meal)) ? "match" : "mismatch";
}

export function evaluateHall(hall: HallRecord, filters: FilterState): FilteredHall | null {
  const checks: Array<{ state: MatchState; reason: string }> = [];

  if (filters.keyword && filters.keyword.trim()) {
    const query = filters.keyword.trim().toLowerCase();
    const nameMatch = hall.venueName.toLowerCase().includes(query) ||
      hall.hallName.toLowerCase().includes(query) ||
      hall.sigungu.toLowerCase().includes(query) ||
      hall.district.toLowerCase().includes(query);
    checks.push({ state: nameMatch ? "match" : "mismatch", reason: "검색어" });
  }

  if (filters.sidos.length > 0 || filters.regionCodes.length > 0) {
    const locationMatch = filters.sidos.includes(hall.sido) || filters.regionCodes.includes(hall.regionCode);
    checks.push({ state: locationMatch ? "match" : "mismatch", reason: "지역" });
  }

  for (const group of TYPE_GROUPS) {
    const selected = filters.hallTypes.filter((type) => group.includes(type));
    if (selected.length > 0) {
      checks.push({ state: combine(selected.map((type) => matchType(hall, type))), reason: "웨딩홀 타입" });
    }
  }

  if (filters.guests !== null) checks.push({ state: matchGuests(hall, filters.guests), reason: "수용·보증인원" });
  if (filters.naturalLight) {
    checks.push({
      state: hall.naturalLight === "yes" || hall.naturalLight === "partial"
        ? "match"
        : hall.naturalLight === "unknown" ? "unknown" : "mismatch",
      reason: "자연광",
    });
  }
  if (filters.ceremonyFormats.length > 0) {
    checks.push({ state: matchCeremony(hall, filters.ceremonyFormats), reason: "예식 형태" });
  }
  if (filters.intervalAtLeast !== null) {
    checks.push({ state: matchInterval(hall, filters.intervalAtLeast), reason: "예식 간격" });
  }
  if (filters.meals.length > 0) checks.push({ state: matchMeals(hall, filters.meals), reason: "식사 유형" });

  if (checks.some((check) => check.state === "mismatch")) return null;
  const unknownReasons = checks.filter((check) => check.state === "unknown").map((check) => check.reason);
  return { hall, state: unknownReasons.length > 0 ? "unknown" : "match", unknownReasons };
}

export function filterHalls(halls: HallRecord[], filters: FilterState): {
  matched: FilteredHall[];
  unknown: FilteredHall[];
} {
  const evaluated = halls.map((hall) => evaluateHall(hall, filters)).filter((item): item is FilteredHall => item !== null);
  const sortByCheckedAt = (a: FilteredHall, b: FilteredHall) =>
    (b.hall.detailCheckedAt ?? b.hall.classificationCheckedAt ?? "").localeCompare(
      a.hall.detailCheckedAt ?? a.hall.classificationCheckedAt ?? "",
    );
  return {
    matched: evaluated.filter((item) => item.state === "match").sort(sortByCheckedAt),
    unknown: evaluated.filter((item) => item.state === "unknown").sort(sortByCheckedAt),
  };
}

export const EMPTY_FILTERS: FilterState = {
  keyword: "",
  sidos: [],
  regionCodes: [],
  hallTypes: [],
  guests: null,
  naturalLight: false,
  ceremonyFormats: [],
  intervalAtLeast: null,
  meals: [],
};
