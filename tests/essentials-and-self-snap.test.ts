import { describe, it, expect } from "vitest";
import essentialsData from "../src/data/wedding-essentials.json";
import selfSnapItemsData from "../src/data/self-snap-items.json";
import selfSnapVenuesData from "../src/data/self-snap-venues.json";

describe("Wedding Essentials & Self Snap Data Integrity", () => {
  it("validates wedding essentials dataset", () => {
    expect(essentialsData.length).toBeGreaterThanOrEqual(6);
    for (const item of essentialsData) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.brand).toBeTruthy();
      expect(item.affiliateUrl).toMatch(/^https?:\/\//);
      expect(item.stages.length).toBeGreaterThan(0);
      expect(item.editorNote).toBeTruthy();
    }
  });

  it("validates self-snap items dataset", () => {
    expect(selfSnapItemsData.length).toBeGreaterThan(0);
    for (const item of selfSnapItemsData) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.affiliateUrl).toMatch(/^https?:\/\//);
    }
  });

  it("validates self-snap venues dataset", () => {
    expect(selfSnapVenuesData.length).toBeGreaterThan(0);
    for (const venue of selfSnapVenuesData) {
      expect(venue.id).toBeTruthy();
      expect(venue.name).toBeTruthy();
      expect(venue.region).toBeTruthy();
      expect(venue.features.length).toBeGreaterThan(0);
    }
  });
});
