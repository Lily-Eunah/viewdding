import { describe, expect, it } from "vitest";
import { HALL_LOCATION_OVERRIDES } from "../src/data/hall-location-overrides";
import geocodesJson from "../src/data/hall-venue-geocodes.generated.json";
import hallsJson from "../src/data/halls.generated.json";

describe("wedding hall location overrides", () => {
  it("keeps all 37 previously unresolved venue addresses evidence-backed", () => {
    expect(Object.keys(HALL_LOCATION_OVERRIDES)).toHaveLength(37);
    for (const override of Object.values(HALL_LOCATION_OVERRIDES)) {
      expect(override.address).toMatch(/^서울특별시 /);
      expect(override.sourceUrl).toMatch(/^https?:\/\//);
    }
  });

  it("corrects Lavinium to Songpa-gu using its current official address", () => {
    expect(HALL_LOCATION_OVERRIDES["V-SEO-20260729-108"]).toMatchObject({
      address: "서울특별시 송파구 천호대로 996",
      district: "송파구",
      sourceType: "official_venue",
    });
  });

  it("keeps every published venue mappable after the address backfill", () => {
    const venueIds = new Set(hallsJson.map((hall) => hall.venueId));
    expect(venueIds.size).toBe(340);
    for (const venueId of venueIds) {
      expect(geocodesJson).toHaveProperty(venueId);
    }
  });

  it("persists the address evidence with every backfilled geocode", () => {
    for (const [venueId, override] of Object.entries(HALL_LOCATION_OVERRIDES)) {
      expect(geocodesJson[venueId as keyof typeof geocodesJson]).toMatchObject({
        district: override.district ?? override.address.split(" ")[1],
        sourceAddress: override.address,
        sourceUrl: override.sourceUrl,
        sourceType: override.sourceType,
      });
    }
  });
});
