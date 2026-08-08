import { describe, expect, it } from "vitest";
import type { HallRecord } from "../src/domain/types";
import { hallMatchesSeoCollection, HALL_SEO_SLUGS, isHallSeoSlug } from "../src/lib/hall-seo";

function hall(overrides: Partial<HallRecord> = {}): HallRecord {
  return {
    id: "H-1", venueId: "V-1", venueName: "테스트 예식장", hallName: "테스트홀", district: "강남구",
    neighborhood: null, address: null, phone: null, website: null, instagram: null, mapUrl: null,
    publicStatus: "public", lighting: "bright", naturalLight: "yes", chapel: false, house: false,
    indoorOutdoor: "indoor", venueType: "professional_convention", ceremonyFormat: "separate",
    meals: [], seated: { min: null, max: null, raw: null }, capacity: { min: null, max: null, raw: null },
    guarantee: { min: null, max: null, raw: null }, interval: { min: null, max: null, raw: null },
    ceremonyTime: null, virginRoad: null, ceilingHeight: null, featureTags: [], classificationEvidence: null,
    confidence: null, classificationCheckedAt: null, detailCheckedAt: null, sourceId: null, sourceUrl: null,
    sourceType: null, raw: { representativeClassification: null, lighting: null, naturalLight: null, ceremonyFormat: null, mealType: null, venueType: null },
    ...overrides,
  };
}

describe("hall SEO collections", () => {
  it("supports only the published type slugs", () => {
    expect(HALL_SEO_SLUGS).toEqual(["bright", "dark", "chapel", "outdoor"]);
    expect(isHallSeoSlug("bright")).toBe(true);
    expect(isHallSeoSlug("hotel")).toBe(false);
  });

  it("includes transitional halls in both lighting collections", () => {
    const transitional = hall({ lighting: "transitional" });
    expect(hallMatchesSeoCollection(transitional, "bright")).toBe(true);
    expect(hallMatchesSeoCollection(transitional, "dark")).toBe(true);
  });

  it("requires confirmed chapel and outdoor classifications", () => {
    expect(hallMatchesSeoCollection(hall({ chapel: true }), "chapel")).toBe(true);
    expect(hallMatchesSeoCollection(hall({ chapel: null }), "chapel")).toBe(false);
    expect(hallMatchesSeoCollection(hall({ indoorOutdoor: "outdoor" }), "outdoor")).toBe(true);
    expect(hallMatchesSeoCollection(hall({ indoorOutdoor: "both" }), "outdoor")).toBe(true);
    expect(hallMatchesSeoCollection(hall({ indoorOutdoor: "unknown" }), "outdoor")).toBe(false);
  });
});
