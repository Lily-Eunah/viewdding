import type {
  CeremonyFormat,
  IndoorOutdoor,
  LightingType,
  MealType,
  NaturalLight,
  NumericRange,
  VenueType,
} from "./types";

const UNKNOWN_TOKENS = new Set(["", "-", "미확인", "확인 필요", "값 미공개"]);

export function cleanText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return UNKNOWN_TOKENS.has(text) ? null : text;
}

export function normalizeLighting(value: unknown): LightingType {
  const text = cleanText(value);
  if (text === "밝음" || text === "자연광") return "bright";
  if (text === "어두움") return "dark";
  if (text === "전환형") return "transitional";
  return "unknown";
}

export function normalizeNaturalLight(value: unknown): NaturalLight {
  const text = cleanText(value);
  if (text === "Y") return "yes";
  if (text === "부분") return "partial";
  if (text === "N") return "no";
  return "unknown";
}

export function normalizeBoolean(value: unknown): boolean | null {
  const text = cleanText(value);
  if (text === "Y") return true;
  if (text === "N") return false;
  return null;
}

export function normalizeIndoorOutdoor(value: unknown): IndoorOutdoor {
  const text = cleanText(value);
  if (text === "실내") return "indoor";
  if (text === "야외") return "outdoor";
  if (["실내외 병행", "실내·야외", "하이브리드", "혼합"].includes(text ?? "")) return "both";
  return "unknown";
}

export function normalizeVenueType(value: unknown): VenueType {
  const text = cleanText(value);
  if (text === "호텔") return "hotel";
  if (text === "전문웨딩홀" || text === "컨벤션") return "professional_convention";
  if (text === "공공·대관" || text === "공공·대학") return "public";
  if (text === "하우스" || text === "하우스웨딩홀") return "house_venue";
  if (text === "종교시설" || text === "문화시설") return "other";
  return "unknown";
}

export function normalizeCeremonyFormat(value: unknown, mealText?: unknown): CeremonyFormat {
  const text = cleanText(value);
  if (text === "분리예식" || text === "전통혼례·분리예식") return "separate";
  if (text === "동시예식") return "simultaneous";
  if (text === "동시·분리 선택") return "selectable";

  const meal = cleanText(mealText);
  if (meal?.includes("/분리")) return "separate";
  if (meal?.includes("/동시")) return "simultaneous";
  return "unknown";
}

export function normalizeMeals(value: unknown, ceremonyFormat: CeremonyFormat): MealType[] {
  const text = cleanText(value);
  if (!text || text.includes("운영 문의") || text.includes("미확인")) return [];

  const results = new Set<MealType>();
  if (text.includes("뷔페")) results.add("buffet");
  if (text.includes("코스")) results.add("course");
  if (text.includes("한식") || text.includes("한정식") || text.includes("한상차림") || text.includes("모던한식")) {
    results.add("korean");
  }
  if (text.includes("케이터링") || text.includes("도시락")) results.add("catering");
  if (text.includes("피로연 미제공")) results.add("no_meal");
  if (text.includes("중식") && results.size === 0) results.add("other");
  if (
    results.size === 0 &&
    ceremonyFormat === "simultaneous" &&
    (text.includes("양식/동시") || text.includes("한식·양식/동시"))
  ) {
    results.add("course");
  }
  return Array.from(results);
}

export function parseNumericRange(value: unknown): NumericRange {
  const raw = typeof value === "number" || typeof value === "string" ? value : null;
  if (typeof value === "number" && Number.isFinite(value)) return { min: value, max: value, raw };
  const text = cleanText(value);
  if (!text) return { min: null, max: null, raw };
  const numbers = text.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (numbers.length === 0) return { min: null, max: null, raw };
  if (numbers.length === 1) return { min: numbers[0], max: numbers[0], raw };
  return { min: Math.min(numbers[0], numbers[1]), max: Math.max(numbers[0], numbers[1]), raw };
}

export function splitTags(value: unknown): string[] {
  const text = cleanText(value);
  if (!text) return [];
  return text.split(/[|,]/).map((item) => item.trim()).filter(Boolean);
}
