import { describe, expect, it } from "vitest";
import {
  geocodeAddressCandidates,
  normalizeAddressKey,
  restaurantGeocodeFromDocument,
} from "../src/domain/restaurant-geocoding";

describe("restaurant geocoding", () => {
  it("keeps the full address and adds a road-address fallback", () => {
    expect(geocodeAddressCandidates(" 서울 강남구 테헤란로6길 48 2층 ")).toEqual([
      "서울 강남구 테헤란로6길 48 2층",
      "서울 강남구 테헤란로6길 48",
    ]);
  });

  it("normalizes cache keys", () => {
    expect(normalizeAddressKey("서울  강남구  테헤란로 1")).toBe("서울 강남구 테헤란로 1");
  });

  it("maps Kakao x/y to longitude/latitude", () => {
    expect(restaurantGeocodeFromDocument({
      address_name: "서울 강남구 역삼동 1",
      road_address: { address_name: "서울 강남구 테헤란로 1" },
      x: "127.0276",
      y: "37.4979",
    }, "서울 강남구 테헤란로 1")).toEqual({
      latitude: 37.4979,
      longitude: 127.0276,
      matchedAddress: "서울 강남구 테헤란로 1",
      query: "서울 강남구 테헤란로 1",
    });
  });
});
