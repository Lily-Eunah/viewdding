import { describe, expect, it } from "vitest";
import { evaluateHall as evaluateHallOnClient, EMPTY_FILTERS } from "../src/domain/filter";
import { evaluateRestaurant as evaluateRestaurantOnClient, EMPTY_RESTAURANT_FILTERS } from "../src/domain/restaurant-filter";
import type { FilterState, FilteredHall, HallRecord } from "../src/domain/types";
import type { FilteredRestaurant, RestaurantFilterState, RestaurantRecord } from "../src/domain/restaurant-types";
// @ts-expect-error The deployed Worker intentionally stays framework-free JavaScript.
import { evaluateHall as evaluateHallOnWorker, evaluateRestaurant as evaluateRestaurantOnWorker } from "../worker/static-site.js";

function decision(result: FilteredHall | FilteredRestaurant | null) {
  return result ? { state: result.state, unknownReasons: result.unknownReasons } : null;
}

function restaurant(overrides: Partial<RestaurantRecord> = {}): RestaurantRecord {
  return {
    id: "R1:invitation", sourceId: "R1", status: "공개가능", purpose: "invitation", name: "테스트",
    branch: null, cuisines: ["한식"], venueType: "한정식", district: "강남구", area: "강남역",
    address: null, nearestStation: "강남역", stationExit: null, walkingMinutes: 5,
    pricePerPerson: { min: 30000, max: 50000, raw: "30000~50000" }, lunchPriceMin: null, dinnerPriceMin: null,
    courseAvailable: "yes", privateRoom: "yes", roomCapacity: { min: 4, max: 10, raw: "4~10" },
    parking: "available", parkingDetail: null, closedWeekdays: ["sun"], regularClosedDaysRaw: "일",
    naverMapUrl: null, kakaoMapUrl: null, sourceCount: 2, officialEvidence: null, recommendationPoints: null,
    captionTags: [], verifiedAt: "2026-08-05", notes: null, latitude: 37.5, longitude: 127, active: true,
    ...overrides,
  };
}

function hall(overrides: Partial<HallRecord> = {}): HallRecord {
  return {
    id: "H-1", venueId: "V-1", venueName: "테스트", hallName: "홀",
    sido: "서울특별시", sigungu: "강남구", subdistrict: null, regionCode: "VDD-11-023", metroArea: "서울 동남권", district: "강남구",
    neighborhood: null, address: null, phone: null, website: null, instagram: null, mapUrl: null,
    publicStatus: "public", lighting: "bright", naturalLight: "yes", chapel: true, house: false,
    indoorOutdoor: "indoor", venueType: "professional_convention", ceremonyFormat: "separate",
    meals: ["buffet"], seated: { min: 200, max: 200, raw: 200 }, capacity: { min: 250, max: 250, raw: 250 },
    guarantee: { min: 150, max: 150, raw: 150 }, interval: { min: 90, max: 90, raw: 90 },
    ceremonyTime: null, virginRoad: null, ceilingHeight: null, featureTags: [], classificationEvidence: null,
    confidence: "A", classificationCheckedAt: null, detailCheckedAt: null, sourceId: null, sourceUrl: null,
    sourceType: null, latitude: 37.5, longitude: 127,
    raw: { representativeClassification: null, lighting: "밝음", naturalLight: "Y", ceremonyFormat: "분리예식", mealType: "뷔페", venueType: "전문웨딩홀" },
    ...overrides,
  };
}

describe("search worker filter parity", () => {
  it("matches the restaurant domain filter decisions", () => {
    const filters: RestaurantFilterState[] = [
      { ...EMPTY_RESTAURANT_FILTERS },
      { ...EMPTY_RESTAURANT_FILTERS, purpose: "family_meeting", cuisines: ["한식"], privateRoomOnly: true },
      { ...EMPTY_RESTAURANT_FILTERS, district: "강남구", weekday: "sun", budgetMax: 70000, parkingOnly: true },
      { ...EMPTY_RESTAURANT_FILTERS, courseOnly: true, privateRoomOnly: true, partySize: 8 },
    ];

    const fixtures = [
      restaurant(),
      restaurant({ purpose: "family_meeting", cuisines: ["한우", "스테이크"], privateRoom: "unknown" }),
      restaurant({ closedWeekdays: null, pricePerPerson: { min: null, max: null, raw: null }, parking: "unknown" }),
      restaurant({ courseAvailable: "no", privateRoom: "no", roomCapacity: { min: null, max: null, raw: null } }),
    ];
    for (const restaurant of fixtures) {
      for (const filter of filters) {
        expect(decision(evaluateRestaurantOnWorker(restaurant, filter))).toEqual(
          decision(evaluateRestaurantOnClient(restaurant, filter)),
        );
      }
    }
  });

  it("matches the wedding hall domain filter decisions", () => {
    const filters: FilterState[] = [
      { ...EMPTY_FILTERS },
      { ...EMPTY_FILTERS, sidos: ["서울특별시"], hallTypes: ["bright", "chapel"] },
      { ...EMPTY_FILTERS, guests: 250, naturalLight: true, intervalAtLeast: 90 },
      { ...EMPTY_FILTERS, ceremonyFormats: ["separate"], meals: ["buffet"] },
    ];

    const fixtures = [
      hall(),
      hall({ lighting: "transitional", chapel: null, naturalLight: "unknown" }),
      hall({ capacity: { min: null, max: null, raw: null }, guarantee: { min: null, max: null, raw: null } }),
      hall({ ceremonyFormat: "unknown", meals: [], interval: { min: null, max: null, raw: null } }),
    ];
    for (const hall of fixtures) {
      for (const filter of filters) {
        expect(decision(evaluateHallOnWorker(hall, filter))).toEqual(
          decision(evaluateHallOnClient(hall, filter)),
        );
      }
    }
  });
});
