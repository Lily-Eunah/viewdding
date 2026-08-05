import type { CeremonyFormat, HallRecord, HallTypeFilter, MealType } from "@/domain/types";

export const HALL_TYPE_GROUPS: Array<{ label: string; options: Array<{ value: HallTypeFilter; label: string }> }> = [
  { label: "분위기", options: [{ value: "bright", label: "밝은홀" }, { value: "dark", label: "어두운홀" }] },
  { label: "공간 스타일", options: [{ value: "chapel", label: "채플홀" }, { value: "house", label: "하우스웨딩홀" }, { value: "outdoor", label: "야외예식 가능" }] },
  { label: "예식장 형태", options: [{ value: "hotel", label: "호텔웨딩" }, { value: "professional", label: "전문·컨벤션" }, { value: "public", label: "공공예식장" }] },
];

export const CEREMONY_OPTIONS: Array<{ value: Exclude<CeremonyFormat, "unknown">; label: string }> = [
  { value: "separate", label: "분리예식" }, { value: "simultaneous", label: "동시예식" }, { value: "selectable", label: "선택 가능" },
];

export const MEAL_OPTIONS: Array<{ value: Exclude<MealType, "no_meal" | "other">; label: string }> = [
  { value: "buffet", label: "뷔페" }, { value: "course", label: "코스" }, { value: "korean", label: "한식·한정식" }, { value: "catering", label: "케이터링" },
];

export const INTERVAL_OPTIONS = [70, 90, 120, 180];

export function hallTypeLabel(value: HallTypeFilter): string {
  return HALL_TYPE_GROUPS.flatMap((group) => group.options).find((option) => option.value === value)?.label ?? value;
}

export function hallTags(hall: HallRecord): string[] {
  const tags: string[] = [];
  if (hall.lighting === "bright") tags.push("밝은홀");
  if (hall.lighting === "dark") tags.push("어두운홀");
  if (hall.lighting === "transitional") tags.push("전환형홀");
  if (hall.chapel) tags.push("채플홀");
  if (hall.house) tags.push("하우스웨딩홀");
  if (hall.indoorOutdoor === "outdoor" || hall.indoorOutdoor === "both") tags.push("야외예식 가능");
  if (hall.venueType === "hotel") tags.push("호텔웨딩");
  if (hall.venueType === "professional_convention") tags.push("전문·컨벤션");
  if (hall.venueType === "public") tags.push("공공예식장");
  return tags.slice(0, 4);
}

export function rangeLabel(range: HallRecord["capacity"], suffix = "명"): string {
  if (range.min === null || range.max === null) return "확인 필요";
  return range.min === range.max ? `${range.max.toLocaleString()}${suffix}` : `${range.min.toLocaleString()}–${range.max.toLocaleString()}${suffix}`;
}

export function ceremonyLabel(value: CeremonyFormat): string {
  return CEREMONY_OPTIONS.find((option) => option.value === value)?.label ?? "확인 필요";
}

export function mealLabels(values: MealType[]): string {
  if (values.length === 0) return "확인 필요";
  return values.map((value) => MEAL_OPTIONS.find((option) => option.value === value)?.label ?? (value === "no_meal" ? "피로연 미제공" : "기타")).join(" · ");
}
