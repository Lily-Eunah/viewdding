import { describe, expect, it } from "vitest";
import { categorizeRestaurantCuisines } from "../src/domain/restaurant-cuisine";

describe("restaurant cuisine categories", () => {
  it("groups granular menu labels into broad cuisine categories", () => {
    expect(categorizeRestaurantCuisines(["삼겹살", "전통주"])).toContain("한식");
    expect(categorizeRestaurantCuisines(["스시 오마카세"])).toContain("일식");
    expect(categorizeRestaurantCuisines(["딤섬", "중식 코스"])).toContain("중식");
    expect(categorizeRestaurantCuisines(["파스타", "스테이크"])).toContain("양식");
  });

  it("supports multiple cuisine categories and a stable fallback", () => {
    expect(categorizeRestaurantCuisines(["퓨전 한식", "사시미"])).toEqual(["한식", "일식"]);
    expect(categorizeRestaurantCuisines(["월드뷔페"])).toEqual(["기타"]);
  });
});
