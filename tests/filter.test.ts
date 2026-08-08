import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, evaluateHall } from "../src/domain/filter";
import type { HallRecord } from "../src/domain/types";

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
    sourceType: null, raw: { representativeClassification: null, lighting: "밝음", naturalLight: "Y", ceremonyFormat: "분리예식", mealType: "뷔페", venueType: "전문웨딩홀" },
    ...overrides,
  };
}

describe("filter engine", () => {
  it("includes transitional halls in both lighting filters", () => {
    const transitional = hall({ lighting: "transitional" });
    expect(evaluateHall(transitional, { ...EMPTY_FILTERS, hallTypes: ["bright"] })?.state).toBe("match");
    expect(evaluateHall(transitional, { ...EMPTY_FILTERS, hallTypes: ["dark"] })?.state).toBe("match");
  });

  it("separates same-named districts by sido and sigungu", () => {
    const seoul = hall({ sido: "서울특별시", sigungu: "중구", district: "중구" });
    const incheon = hall({ sido: "인천광역시", sigungu: "중구", district: "중구", regionCode: "legacy-incheon-jung" });
    const filters = { ...EMPTY_FILTERS, sido: "서울특별시" as const, sigungu: "중구" };
    expect(evaluateHall(seoul, filters)?.state).toBe("match");
    expect(evaluateHall(incheon, filters)).toBeNull();
  });

  it("matches a metro area independently from administrative filters", () => {
    expect(evaluateHall(hall(), { ...EMPTY_FILTERS, metroArea: "서울 동남권" })?.state).toBe("match");
    expect(evaluateHall(hall(), { ...EMPTY_FILTERS, metroArea: "수원" })).toBeNull();
  });

  it("uses OR inside a type group and AND across groups", () => {
    const result = evaluateHall(hall(), { ...EMPTY_FILTERS, hallTypes: ["bright", "dark", "chapel"] });
    expect(result?.state).toBe("match");
    expect(evaluateHall(hall({ chapel: false }), { ...EMPTY_FILTERS, hallTypes: ["bright", "chapel"] })).toBeNull();
  });

  it("separates missing values instead of silently excluding them", () => {
    const result = evaluateHall(hall({ interval: { min: null, max: null, raw: null } }), { ...EMPTY_FILTERS, intervalAtLeast: 90 });
    expect(result).toMatchObject({ state: "unknown", unknownReasons: ["예식 간격"] });
  });

  it("evaluates guest ranges conservatively", () => {
    const ranged = hall({ guarantee: { min: 150, max: 250, raw: "150~250" } });
    expect(evaluateHall(ranged, { ...EMPTY_FILTERS, guests: 200 })?.state).toBe("unknown");
    expect(evaluateHall(ranged, { ...EMPTY_FILTERS, guests: 100 })).toBeNull();
  });
});
