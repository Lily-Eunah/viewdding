import { describe, expect, it } from "vitest";
import hallsJson from "../src/data/halls.generated.json";
import { hallPhotosByHallId, photosForHall } from "../src/data/hall-photos";

describe("hall photo registry", () => {
  const hallIds = new Set(hallsJson.map((hall) => hall.id));
  const entries = Object.entries(hallPhotosByHallId);

  it("publishes the verified and source-linked hall photo set", () => {
    expect(entries).toHaveLength(238);
    expect(entries.flatMap(([, photos]) => photos)).toHaveLength(238);
  });

  it("only references existing halls", () => {
    for (const [hallId] of entries) expect(hallIds.has(hallId)).toBe(true);
  });

  it("publishes traceable HTTPS photos with explicit source status", () => {
    for (const photos of Object.values(hallPhotosByHallId)) {
      for (const photo of photos) {
        expect(photo.url).toMatch(/^https:\/\//);
        expect(photo.sourceUrl).toMatch(/^https:\/\//);
        expect(["official_website", "public_listing"]).toContain(photo.sourceType);
        expect(["official_source_linked", "public_source_linked"]).toContain(
          photo.usageStatus,
        );
        expect(["wedding_setup", "space_overview"]).toContain(photo.photoKind);
        expect(photo.alt.length).toBeGreaterThan(10);
      }
    }
  });

  it("returns primary photos first and no placeholder for missing halls", () => {
    expect(photosForHall("H-SEO-20260728-002")[0]?.isPrimary).toBe(true);
    expect(photosForHall("missing-hall")).toEqual([]);
  });
});
