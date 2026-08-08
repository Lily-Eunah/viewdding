import { describe, expect, it } from "vitest";
import {
  addressMatchesHallRegion,
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

  it("selects a name-matching place in the requested Gyeonggi district", () => {
    const selected = selectKakaoVenueDocument("테스트컨벤션", "수원시 팔달구", [
      document({ id: "seoul", place_name: "테스트컨벤션", address_name: "서울 강남구", road_address_name: "서울 강남구 테헤란로 1" }),
      document({ id: "gyeonggi", place_name: "테스트컨벤션", address_name: "경기 수원시 팔달구 인계동 1", road_address_name: "경기 수원시 팔달구 효원로 1" }),
    ]);
    expect(selected?.id).toBe("gyeonggi");
  });

  it("selects a name-matching place in Incheon", () => {
    const selected = selectKakaoVenueDocument("테스트컨벤션", { sido: "인천광역시", sigungu: "부평구", subdistrict: null }, [
      document({ id: "seoul", place_name: "테스트컨벤션", address_name: "서울 중구", road_address_name: "서울 중구 세종대로 1" }),
      document({ id: "incheon", place_name: "테스트컨벤션", address_name: "인천 부평구 부평동 1", road_address_name: "인천 부평구 부평대로 1" }),
    ]);
    expect(selected?.id).toBe("incheon");
    expect(addressMatchesHallRegion("인천광역시 부평구 부평대로 1", { sido: "인천광역시", sigungu: "부평구", subdistrict: null })).toBe(true);
  });

  it("accepts supported Korean coordinates and rejects coordinates outside Korea", () => {
    expect(coordinatesFromKakao("127.02", "37.51")).toEqual({ latitude: 37.51, longitude: 127.02 });
    expect(coordinatesFromKakao("127.20", "37.24")).toEqual({ latitude: 37.24, longitude: 127.2 });
    expect(coordinatesFromKakao("129.07", "35.17")).toEqual({ latitude: 35.17, longitude: 129.07 });
    expect(coordinatesFromKakao("140.00", "35.17")).toBeNull();
  });

  it("matches new regional addresses", () => {
    expect(addressMatchesHallRegion("부산광역시 해운대구 해운대해변로 296", { sido: "부산광역시", sigungu: "해운대구", subdistrict: null })).toBe(true);
    expect(addressMatchesHallRegion("경상남도 창원시 성산구 중앙대로 1", { sido: "경상남도", sigungu: "창원시", subdistrict: "성산구" })).toBe(true);
    expect(addressMatchesHallRegion("세종특별자치시 다솜3로 6", { sido: "세종특별자치시", sigungu: "세종시", subdistrict: null })).toBe(true);
  });
});
