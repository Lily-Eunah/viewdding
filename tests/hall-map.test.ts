import { describe, expect, it } from "vitest";
import { groupFilteredHallsByVenue, hallCapacitySummary, hallMapVenuesWithinBounds } from "../src/domain/hall-map";
import type { FilteredHall, HallRecord } from "../src/domain/types";

function hall(overrides: Partial<HallRecord> = {}): HallRecord {
  return {
    id: "H-1", venueId: "V-1", venueName: "테스트 웨딩홀", hallName: "그랜드홀",
    sido: "서울특별시", sigungu: "강남구", subdistrict: null, regionCode: "VDD-11-023", metroArea: "서울 동남권", district: "강남구",
    neighborhood: null, address: "서울 강남구 테스트로 1", phone: null, website: null, instagram: null, mapUrl: null,
    latitude: 37.51, longitude: 127.03, publicStatus: "public", lighting: "bright", naturalLight: "yes",
    chapel: false, house: false, indoorOutdoor: "indoor", venueType: "professional_convention", ceremonyFormat: "separate",
    meals: ["buffet"], seated: { min: 180, max: 180, raw: 180 }, capacity: { min: 250, max: 250, raw: 250 },
    guarantee: { min: 150, max: 150, raw: 150 }, interval: { min: 90, max: 90, raw: 90 }, ceremonyTime: null,
    virginRoad: null, ceilingHeight: null, featureTags: [], classificationEvidence: null, confidence: "A",
    classificationCheckedAt: null, detailCheckedAt: null, sourceId: null, sourceUrl: null, sourceType: null,
    raw: { representativeClassification: null, lighting: "밝음", naturalLight: "Y", ceremonyFormat: "분리예식", mealType: "뷔페", venueType: "전문웨딩홀" },
    ...overrides,
  };
}

function filtered(record: HallRecord, unknownReasons: string[] = []): FilteredHall {
  return { hall: record, state: unknownReasons.length ? "unknown" : "match", unknownReasons };
}

describe("wedding hall map", () => {
  it("groups individual halls into one venue marker", () => {
    const venues = groupFilteredHallsByVenue([
      filtered(hall()),
      filtered(hall({ id: "H-2", hallName: "채플홀" }), ["예식 간격"]),
    ]);

    expect(venues).toHaveLength(1);
    expect(venues[0]).toMatchObject({ venueId: "V-1", venueName: "테스트 웨딩홀", latitude: 37.51, longitude: 127.03 });
    expect(venues[0].halls.map((item) => item.hall.hallName)).toEqual(["그랜드홀", "채플홀"]);
  });

  it("keeps only venues inside the current map bounds", () => {
    const venues = groupFilteredHallsByVenue([
      filtered(hall()),
      filtered(hall({ id: "H-3", venueId: "V-2", venueName: "외부 홀", latitude: 37.7, longitude: 127.2 })),
    ]);

    expect(hallMapVenuesWithinBounds(venues, { south: 37.4, west: 126.9, north: 37.6, east: 127.1 }).map((venue) => venue.venueId)).toEqual(["V-1"]);
  });

  it("summarizes seated and maximum capacities without inventing missing values", () => {
    expect(hallCapacitySummary(hall())).toBe("착석 180명 · 최대 250명");
    expect(hallCapacitySummary(hall({ seated: { min: null, max: null, raw: null } }))).toBe("최대 250명");
    expect(hallCapacitySummary(hall({ seated: { min: null, max: null, raw: null }, capacity: { min: null, max: null, raw: null } }))).toBeNull();
  });
});
