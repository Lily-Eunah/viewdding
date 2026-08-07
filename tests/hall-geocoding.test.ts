import { describe, expect, it } from "vitest";
import {
  coordinatesFromKakao,
  normalizeVenueSearchText,
  selectKakaoVenueDocument,
  venueNameSimilarity,
  type KakaoKeywordDocument,
} from "../src/domain/hall-geocoding";

function document(overrides: Partial<KakaoKeywordDocument>): KakaoKeywordDocument {
  return {
    id: "1",
    place_name: "노블발렌티 삼성점",
    category_name: "문화,예술 > 예식장",
    address_name: "서울 강남구 삼성동 1",
    road_address_name: "서울 강남구 봉은사로 637",
    x: "127.0642",
    y: "37.5142",
    place_url: "https://place.map.kakao.com/1",
    ...overrides,
  };
}

describe("hall venue geocoding", () => {
  it("normalizes common wedding venue suffixes", () => {
    expect(normalizeVenueSearchText("노블발렌티 삼성 웨딩홀")).toBe("노블발렌티삼성");
    expect(venueNameSimilarity("노블발렌티 삼성", "노블발렌티 삼성점")).toBeGreaterThan(0.8);
  });

  it("selects a name-matching place in the requested Seoul district", () => {
    const selected = selectKakaoVenueDocument("노블발렌티 삼성", "강남구", [
      document({ id: "wrong-district", address_name: "경기 성남시 분당구", road_address_name: "경기 성남시 분당구 판교로 1" }),
      document({ id: "wrong-name", place_name: "삼성동 음식점" }),
      document({ id: "correct" }),
    ]);
    expect(selected?.id).toBe("correct");
  });

  it("rejects coordinates outside the Seoul service bounds", () => {
    expect(coordinatesFromKakao("127.02", "37.51")).toEqual({ latitude: 37.51, longitude: 127.02 });
    expect(coordinatesFromKakao("129.07", "35.17")).toBeNull();
  });
});
