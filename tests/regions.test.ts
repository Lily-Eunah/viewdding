import { describe, expect, it } from "vitest";
import { regionDisplayName, resolveRegion } from "../src/domain/regions";

describe("capital area region normalization", () => {
  it("keeps the same stable code across Seoul address aliases", () => {
    const short = resolveRegion("서울 강남구 테헤란로 1", "강남구");
    const official = resolveRegion("서울특별시 강남구 테헤란로 1", "강남구");
    expect(short).toMatchObject({ sido: "서울특별시", sigungu: "강남구", subdistrict: null, metroArea: "서울 동남권" });
    expect(short?.regionCode).toBe(official?.regionCode);
    expect(short?.regionCode).toBe("VDD-11-023");
  });

  it("separates a Gyeonggi city from its optional general district", () => {
    const region = resolveRegion("경기 성남시 분당구 판교역로 178", "성남시 분당구");
    expect(region).toMatchObject({
      sido: "경기도",
      sigungu: "성남시",
      subdistrict: "분당구",
      metroArea: "성남·하남·광주",
    });
    expect(regionDisplayName(region!)).toBe("성남시 분당구");
    expect(region?.regionCode).toBe("VDD-41-009");
  });

  it("recognizes the current Incheon districts", () => {
    expect(resolveRegion("인천광역시 부평구 부평대로 1", "부평구")).toMatchObject({
      sido: "인천광역시",
      sigungu: "부평구",
      metroArea: "부평·계양",
      regionCode: "VDD-28-008",
    });
    expect(resolveRegion("인천 서해구 서곶로 307", "서해구")).toMatchObject({
      sido: "인천광역시",
      sigungu: "서해구",
      metroArea: "청라·서해",
    });
  });

  it("preserves new Gyeonggi general districts as subdistricts", () => {
    expect(resolveRegion("경기 화성시 만세구 향남읍 제암리 334-8", "화성시 만세구")).toMatchObject({
      sido: "경기도",
      sigungu: "화성시",
      subdistrict: "만세구",
      metroArea: "화성·오산",
    });
  });
});
