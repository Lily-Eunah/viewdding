import { describe, expect, it } from "vitest";
import hallsJson from "../src/data/halls.generated.json";
import { hallPhotosByHallId, photosForHall } from "../src/data/hall-photos";

describe("hall photo registry", () => {
  const hallIds = new Set(hallsJson.map((hall) => hall.id));
  const entries = Object.entries(hallPhotosByHallId);

  it("publishes exactly 50 individually verified hall photos", () => {
    expect(entries).toHaveLength(50);
    expect(entries.flatMap(([, photos]) => photos)).toHaveLength(50);
  });

  it("only references existing halls", () => {
    for (const [hallId] of entries) expect(hallIds.has(hallId)).toBe(true);
  });

  it("publishes traceable HTTPS photos from official pages", () => {
    for (const photos of Object.values(hallPhotosByHallId)) {
      for (const photo of photos) {
        expect(photo.url).toMatch(/^https:\/\//);
        expect(photo.sourceUrl).toMatch(/^https:\/\//);
        expect(photo.sourceType).toBe("official_website");
        expect(photo.usageStatus).toBe("official_source_linked");
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
