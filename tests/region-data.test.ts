import { describe, expect, it } from "vitest";
import halls from "../src/data/halls.generated.json";

describe("published hall region data", () => {
  it("has a complete structured region on every public hall", () => {
    expect(halls.length).toBeGreaterThan(0);
    for (const hall of halls) {
      expect(hall.sido).toMatch(/^(서울특별시|경기도|인천광역시)$/);
      expect(hall.sigungu).not.toBe("");
      expect(hall.regionCode).toMatch(/^VDD-(11|41|28)-\d{3}$/);
      expect(hall.metroArea).not.toBe("");
    }
  });

  it("stores Gyeonggi general districts separately from the city", () => {
    const bundang = halls.find((hall) => hall.district === "성남시 분당구");
    expect(bundang).toMatchObject({ sido: "경기도", sigungu: "성남시", subdistrict: "분당구" });
  });
});
