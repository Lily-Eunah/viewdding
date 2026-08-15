import type {
  GatheringPurpose,
  ParkingType,
  RestaurantRecord,
  TriState,
  Weekday,
} from "./restaurant-types";
import type { NumericRange } from "./types";

export type RestaurantSourceRow = Record<string, unknown>;

const WEEKDAY_TOKENS: Record<string, Weekday> = {
  월: "mon",
  화: "tue",
  수: "wed",
  목: "thu",
  금: "fri",
  토: "sat",
  일: "sun",
};

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const result = String(value).trim();
  return result ? result : null;
}

function value(row: RestaurantSourceRow, ...keys: string[]): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
  }
  return null;
}

function number(value: unknown): number | null {
  const normalized = text(value)?.replaceAll(",", "");
  if (!normalized || /확인|미정|없음|-/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function numericRange(minValue: unknown, maxValue: unknown): NumericRange {
  const min = number(minValue);
  const max = number(maxValue);
  if (min !== null && max !== null && min > max) {
    return { min: max, max: min, raw: `${min}~${max}` };
  }
  return { min, max, raw: min === null && max === null ? null : `${min ?? ""}~${max ?? ""}` };
}

function triState(value: unknown): TriState {
  const normalized = text(value)?.toLowerCase();
  if (["true", "yes", "y", "1", "가능", "있음"].includes(normalized ?? "")) return "yes";
  if (["false", "no", "n", "0", "불가", "없음"].includes(normalized ?? "")) return "no";
  return "unknown";
}

function purpose(value: unknown): GatheringPurpose | null {
  const normalized = text(value);
  if (normalized === "청모" || normalized === "청첩장 모임") return "invitation";
  if (normalized === "상견례") return "family_meeting";
  return null;
}

function parking(value: unknown): ParkingType {
  const normalized = text(value)?.toLowerCase();
  if (!normalized || /확인|미정/.test(normalized)) return "unknown";
  if (/발렛/.test(normalized)) return "valet";
  if (["false", "no", "n", "0", "불가", "없음"].includes(normalized)) return "none";
  if (["true", "yes", "y", "1", "가능", "있음"].includes(normalized)) return "available";
  return "unknown";
}

function tags(value: unknown): string[] {
  return (text(value) ?? "")
    .split(/[#,·|/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function cuisines(value: unknown): string[] {
  return (text(value) ?? "")
    .split(/[,·|/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeClosedWeekdays(value: unknown): Weekday[] | null {
  const raw = text(value);
  if (!raw || /확인|미정/.test(raw)) return null;
  if (/없음|연중무휴|무휴/.test(raw)) return [];
  if (/첫째|둘째|셋째|넷째|다섯째|마지막|격주|매월/.test(raw)) return null;

  const tokens = raw
    .replaceAll("매주", "")
    .replaceAll("요일", "")
    .split(/[\s,·/|&~]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const result = Array.from(new Set(tokens.map((token) => WEEKDAY_TOKENS[token]).filter(Boolean)));
  return result.length > 0 ? result : null;
}

export function normalizeRestaurantRow(row: RestaurantSourceRow): RestaurantRecord | null {
  const sourceId = text(value(row, "restaurant_id"));
  const normalizedPurpose = purpose(value(row, "usage_type"));
  const name = text(value(row, "name"));
  if (!sourceId || !normalizedPurpose || !name) return null;

  const cheongmoCount = number(value(row, "cheongmo_source_count")) ?? 0;
  const sanggyeonryeCount = number(value(row, "sanggyeonrye_source_count")) ?? 0;
  const active = triState(value(row, "active")) === "yes";
  const rawClosedDays = text(value(row, "regular_closed_days"));

  return {
    id: `${sourceId}:${normalizedPurpose}`,
    sourceId,
    status: text(value(row, "status")),
    purpose: normalizedPurpose,
    name,
    branch: text(value(row, "branch")),
    cuisines: cuisines(value(row, "cuisine")),
    venueType: text(value(row, "venue_type")),
    district: text(value(row, "region_gu")) ?? "지역 확인 필요",
    area: text(value(row, "region_area")),
    address: text(value(row, "address")),
    nearestStation: text(value(row, "nearest_station")),
    stationExit: text(value(row, "station_exit")),
    walkingMinutes: number(value(row, "walking_minutes")),
    pricePerPerson: numericRange(value(row, "price_min_per_person"), value(row, "price_max_per_person")),
    lunchPriceMin: number(value(row, "lunch_price_min")),
    dinnerPriceMin: number(value(row, "dinner_price_min")),
    courseAvailable: triState(value(row, "course_available")),
    privateRoom: triState(value(row, "private_room")),
    roomCapacity: numericRange(value(row, "room_min_capacity"), value(row, "room_max_capacity")),
    parking: parking(value(row, "parking")),
    parkingDetail: text(value(row, "parking_detail")),
    closedWeekdays: normalizeClosedWeekdays(rawClosedDays),
    regularClosedDaysRaw: rawClosedDays,
    naverMapUrl: text(value(row, "naver_map_url")),
    kakaoMapUrl: text(value(row, "kakao_map_url")),
    sourceCount: normalizedPurpose === "invitation" ? cheongmoCount : sanggyeonryeCount,
    officialEvidence: text(value(row, "official_evidence")),
    recommendationPoints: text(value(row, "recommendation_points")),
    captionTags: tags(value(row, "caption_tags")),
    verifiedAt: text(value(row, "verified_at")),
    notes: text(value(row, "notes")),
    latitude: number(value(row, "latitude", "lat", "위도")),
    longitude: number(value(row, "longitude", "lng", "lon", "경도")),
    active,
  };
}

export function isRestaurantPublic(
  restaurant: Pick<RestaurantRecord, "status" | "active">,
): boolean {
  return restaurant.status === "공개가능" && restaurant.active;
}
