import { describe, expect, it } from "vitest";
import geocodesJson from "../src/data/hall-venue-geocodes.generated.json";
import hallsJson from "../src/data/halls.generated.json";
import sourceJson from "../src/data/incheon-halls.source.generated.json";

describe("Incheon phase-one wedding hall publication", () => {
  const incheonHalls = hallsJson.filter((hall) => hall.id.startsWith("H-IC-"));
  const venueIds = new Set(incheonHalls.map((hall) => hall.venueId));

  it("publishes the 13 verified venues and 22 individual halls", () => {
    expect(sourceJson.venues).toHaveLength(13);
    expect(sourceJson.halls).toHaveLength(22);
    expect(incheonHalls).toHaveLength(22);
    expect(venueIds.size).toBe(13);
  });

  it("keeps the four phase-one districts distinct", () => {
    expect(new Set(incheonHalls.map((hall) => hall.sigungu))).toEqual(
      new Set(["연수구", "남동구", "부평구", "미추홀구"]),
    );
    expect(incheonHalls.every((hall) => hall.sido === "인천광역시")).toBe(true);
  });

  it("has a verified map coordinate for every published venue", () => {
    for (const venueId of venueIds) {
      const geocode = geocodesJson[venueId as keyof typeof geocodesJson];
      expect(geocode).toBeDefined();
      expect("sourceAddress" in geocode ? geocode.sourceAddress : null).toMatch(/^인천(?:광역시)?\s/);
      expect(["연수구", "남동구", "부평구", "미추홀구"]).toContain(geocode.district);
    }
  });
});
