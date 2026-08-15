import { describe, expect, it } from "vitest";
import halls from "../src/data/halls.generated.json";

describe("published hall region data", () => {
  it("has a complete structured region on every public hall", () => {
    expect(halls.length).toBeGreaterThan(0);
    for (const hall of halls) {
      expect(hall.sido).toMatch(/^(서울특별시|경기도|인천광역시|부산광역시|경상남도|대전광역시|세종특별자치시|대구광역시|광주광역시|충청남도|울산광역시|충청북도|제주특별자치도|전북특별자치도)$/);
      expect(hall.sigungu).not.toBe("");
      expect(hall.regionCode).toMatch(/^VDD-(11|41|28|26|48|30|36|27|29|44|31|43|50|52)-\d{3}$/);
      expect(hall.metroArea).not.toBe("");
    }
  });

  it("publishes the regional expansion in the requested order", () => {
    const counts = halls.reduce<Record<string, number>>((result, hall) => {
      result[hall.sido] = (result[hall.sido] ?? 0) + 1;
      return result;
    }, {});
    expect(counts).toMatchObject({ 부산광역시: 17, 경상남도: 9, 대전광역시: 15, 세종특별자치시: 1, 대구광역시: 26 });
  });

  it("publishes the saturated national follow-up expansion in the requested order", () => {
    const counts = halls.reduce<Record<string, number>>((result, hall) => {
      result[hall.sido] = (result[hall.sido] ?? 0) + 1;
      return result;
    }, {});
    expect(counts).toMatchObject({
      광주광역시: 16,
      충청남도: 18,
      울산광역시: 14,
      충청북도: 11,
      제주특별자치도: 10,
      전북특별자치도: 21,
    });
  });

  it("stores Gyeonggi general districts separately from the city", () => {
    const bundang = halls.find((hall) => hall.district === "성남시 분당구");
    expect(bundang).toMatchObject({ sido: "경기도", sigungu: "성남시", subdistrict: "분당구" });
  });
});
