import type { RestaurantRecord, Weekday } from "@/domain/restaurant-types";

const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "월", tue: "화", wed: "수", thu: "목", fri: "금", sat: "토", sun: "일",
};

const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export function restaurantName(restaurant: RestaurantRecord): string {
  return `${restaurant.name}${restaurant.branch ? ` ${restaurant.branch}` : ""}`;
}

export function gatheringPurposeLabel(restaurant: RestaurantRecord): string {
  return restaurant.purpose === "invitation" ? "청첩장 모임" : "상견례";
}

export function restaurantPriceLabel(restaurant: RestaurantRecord): string {
  const { min, max } = restaurant.pricePerPerson;
  if (min !== null && max !== null) return min === max ? won(min) : `${won(min)}~${won(max)}`;
  if (min !== null) return `${won(min)}부터`;
  if (max !== null) return `${won(max)}까지`;
  return "확인 필요";
}

export function restaurantMealMinimumLabel(
  restaurant: Pick<RestaurantRecord, "lunchPriceMin" | "dinnerPriceMin">,
): string | null {
  const { lunchPriceMin, dinnerPriceMin } = restaurant;
  if (lunchPriceMin === null && dinnerPriceMin === null) return null;
  if (lunchPriceMin !== null && lunchPriceMin === dinnerPriceMin) {
    return `점심·저녁 ${won(lunchPriceMin)}`;
  }
  return [
    lunchPriceMin !== null ? `점심 ${won(lunchPriceMin)}` : null,
    dinnerPriceMin !== null ? `저녁 ${won(dinnerPriceMin)}` : null,
  ].filter((value): value is string => value !== null).join(" · ");
}

export function restaurantCompanionVisitLabel(companion: string): string {
  const normalized = companion.trim();
  const lastCharacter = normalized.at(-1);
  if (!lastCharacter) return "동행 정보";

  const codePoint = lastCharacter.charCodeAt(0);
  if (codePoint < 0xac00 || codePoint > 0xd7a3) return `동행 · ${normalized}`;

  const hasFinalConsonant = (codePoint - 0xac00) % 28 !== 0;
  return `${normalized}${hasFinalConsonant ? "과" : "와"} 방문`;
}

export function restaurantRoomLabel(restaurant: RestaurantRecord): string {
  if (restaurant.privateRoom === "no") return "룸 없음";
  const { min, max } = restaurant.roomCapacity;
  if (min !== null && max !== null) return min === max ? `${min}명` : `${min}~${max}명`;
  if (min !== null) return `${min}명 이상`;
  if (max !== null) return `${max}명까지`;
  return restaurant.privateRoom === "yes" ? "룸 있음 · 인원 확인 필요" : "확인 필요";
}

export function restaurantParkingLabel(restaurant: RestaurantRecord): string {
  if (restaurant.parking === "valet") return "발렛";
  if (restaurant.parking === "available") return "가능";
  if (restaurant.parking === "none") return "불가";
  return "확인 필요";
}

export function restaurantClosedDaysLabel(restaurant: RestaurantRecord): string {
  if (restaurant.closedWeekdays === null) return restaurant.regularClosedDaysRaw ?? "확인 필요";
  if (restaurant.closedWeekdays.length === 0) return "정기 휴무 없음";
  return `${restaurant.closedWeekdays.map((day) => WEEKDAY_LABELS[day]).join("·")} 휴무`;
}

export function restaurantStationLabel(restaurant: RestaurantRecord): string {
  if (!restaurant.nearestStation) return "가까운 역 확인 필요";
  const exit = restaurant.stationExit ? ` ${restaurant.stationExit}` : "";
  const walk = restaurant.walkingMinutes !== null ? ` · 도보 ${restaurant.walkingMinutes}분` : "";
  return `${restaurant.nearestStation}${exit}${walk}`;
}
