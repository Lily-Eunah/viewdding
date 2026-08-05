import { describe, expect, it } from "vitest";
import { normalizeClosedWeekdays, normalizeRestaurantRow } from "../src/domain/restaurant-normalization";

describe("restaurant normalization", () => {
  it("normalizes weekly closure days", () => {
    expect(normalizeClosedWeekdays("매주 월요일 · 수요일")).toEqual(["mon", "wed"]);
    expect(normalizeClosedWeekdays("토/일")).toEqual(["sat", "sun"]);
    expect(normalizeClosedWeekdays("없음")).toEqual([]);
  });

  it("keeps irregular monthly closures unknown", () => {
    expect(normalizeClosedWeekdays("둘째·넷째 월요일")).toBeNull();
    expect(normalizeClosedWeekdays("확인필요")).toBeNull();
  });

  it("builds a room capacity range and optional coordinates", () => {
    const restaurant = normalizeRestaurantRow({
      restaurant_id: "R100",
      usage_type: "상견례",
      name: "테스트 식당",
      region_gu: "강남구",
      room_min_capacity: "4",
      room_max_capacity: "12",
      regular_closed_days: "일",
      latitude: "37.5",
      longitude: "127.1",
      active: "TRUE",
    });
    expect(restaurant).toMatchObject({
      id: "R100:family_meeting",
      purpose: "family_meeting",
      roomCapacity: { min: 4, max: 12 },
      closedWeekdays: ["sun"],
      latitude: 37.5,
      longitude: 127.1,
      active: true,
    });
  });
});
