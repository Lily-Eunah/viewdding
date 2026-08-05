import { describe, expect, it } from "vitest";
import { EMPTY_RESTAURANT_FILTERS, evaluateRestaurant } from "../src/domain/restaurant-filter";
import type { RestaurantRecord } from "../src/domain/restaurant-types";

function restaurant(overrides: Partial<RestaurantRecord> = {}): RestaurantRecord {
  return {
    id: "R1:invitation", sourceId: "R1", status: "공개후보", purpose: "invitation", name: "테스트",
    branch: null, cuisines: ["한식"], venueType: "한정식", district: "강남구", area: "강남역",
    address: null, nearestStation: "강남역", stationExit: null, walkingMinutes: 5,
    pricePerPerson: { min: 30000, max: 50000, raw: "30000~50000" }, lunchPriceMin: null, dinnerPriceMin: null,
    courseAvailable: "yes", privateRoom: "yes", roomCapacity: { min: 4, max: 10, raw: "4~10" },
    parking: "available", parkingDetail: null, closedWeekdays: ["sun"], regularClosedDaysRaw: "일",
    naverMapUrl: null, kakaoMapUrl: null, sourceCount: 2, officialEvidence: null, recommendationPoints: null,
    captionTags: [], verifiedAt: "2026-08-05", notes: null, latitude: null, longitude: null, active: true,
    ...overrides,
  };
}

describe("restaurant filter", () => {
  it("excludes restaurants closed on the selected weekday", () => {
    expect(evaluateRestaurant(restaurant(), { ...EMPTY_RESTAURANT_FILTERS, weekday: "sun" })).toBeNull();
    expect(evaluateRestaurant(restaurant(), { ...EMPTY_RESTAURANT_FILTERS, weekday: "sat" })?.state).toBe("match");
  });

  it("separates unknown closure information", () => {
    const result = evaluateRestaurant(restaurant({ closedWeekdays: null }), { ...EMPTY_RESTAURANT_FILTERS, weekday: "fri" });
    expect(result).toMatchObject({ state: "unknown", unknownReasons: ["방문 요일"] });
  });

  it("matches room capacity inclusively", () => {
    expect(evaluateRestaurant(restaurant(), { ...EMPTY_RESTAURANT_FILTERS, partySize: 4 })?.state).toBe("match");
    expect(evaluateRestaurant(restaurant(), { ...EMPTY_RESTAURANT_FILTERS, partySize: 10 })?.state).toBe("match");
    expect(evaluateRestaurant(restaurant(), { ...EMPTY_RESTAURANT_FILTERS, partySize: 11 })).toBeNull();
  });

  it("keeps rows separate by gathering purpose", () => {
    expect(evaluateRestaurant(restaurant(), { ...EMPTY_RESTAURANT_FILTERS, purpose: "family_meeting" })).toBeNull();
  });
});
