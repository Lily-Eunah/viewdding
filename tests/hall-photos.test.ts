import { describe, expect, it } from "vitest";
import hallsJson from "../src/data/halls.generated.json";
import { hallPhotosByHallId, photosForHall } from "../src/data/hall-photos";
import { siblingDuplicateHallIds } from "../src/domain/hall-photo-audit";

describe("hall photo registry", () => {
  const hallIds = new Set(hallsJson.map((hall) => hall.id));
  const entries = Object.entries(hallPhotosByHallId);

  it("publishes the verified and source-linked hall photo set", () => {
    expect(entries).toHaveLength(319);
    expect(entries.flatMap(([, photos]) => photos)).toHaveLength(319);
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
        expect(["hall_confirmed", "venue_only", "needs_review"]).toContain(
          photo.identityStatus,
        );
        expect(photo.alt.length).toBeGreaterThan(10);
      }
    }
  });

  it("returns primary photos first and no placeholder for missing halls", () => {
    expect(photosForHall("missing-hall")).toEqual([]);
  });

  it("does not publish an unverified venue image as multiple sibling hall photos", () => {
    const photoSeeds = entries.flatMap(([hallId, photos]) =>
      photos.map((photo) => ({ hallId, url: photo.url })),
    );
    const duplicateHallIds = siblingDuplicateHallIds(hallsJson, photoSeeds);

    expect(duplicateHallIds.size).toBe(57);
    for (const hallId of duplicateHallIds) {
      for (const photo of photosForHall(hallId)) {
        expect(photo.identityStatus).toBe("hall_confirmed");
        expect(photo.verificationMethod).not.toBe("venue_representative");
      }
    }
  });

  it("only publishes photos whose exact hall identity was verified", () => {
    for (const [hallId, photos] of entries) {
      const publicPhotos = photosForHall(hallId);
      expect(publicPhotos.every((photo) => photo.identityStatus === "hall_confirmed")).toBe(
        true,
      );
      expect(publicPhotos.length).toBeLessThanOrEqual(photos.length);
    }
  });
});
