import { describe, expect, it } from "vitest";
import {
  restaurantCompanionVisitLabel,
  restaurantMealMinimumLabel,
} from "../src/lib/restaurant-labels";

describe("restaurant meal minimum label", () => {
  it("combines matching lunch and dinner prices", () => {
    expect(restaurantMealMinimumLabel({ lunchPriceMin: 15_000, dinnerPriceMin: 15_000 }))
      .toBe("점심·저녁 15,000원");
  });

  it("shows different lunch and dinner prices without an ambiguous slash", () => {
    expect(restaurantMealMinimumLabel({ lunchPriceMin: 15_000, dinnerPriceMin: 30_000 }))
      .toBe("점심 15,000원 · 저녁 30,000원");
  });

  it("omits an unavailable meal period", () => {
    expect(restaurantMealMinimumLabel({ lunchPriceMin: null, dinnerPriceMin: 30_000 }))
      .toBe("저녁 30,000원");
  });

  it("returns no label when both prices are unavailable", () => {
    expect(restaurantMealMinimumLabel({ lunchPriceMin: null, dinnerPriceMin: null })).toBeNull();
  });
});

describe("restaurant companion visit label", () => {
  it("uses 와 after a companion type without a final consonant", () => {
    expect(restaurantCompanionVisitLabel("친구")).toBe("친구와 방문");
  });

  it("uses 과 after a companion type with a final consonant", () => {
    expect(restaurantCompanionVisitLabel("가족")).toBe("가족과 방문");
  });

  it("uses a neutral label for non-Korean companion types", () => {
    expect(restaurantCompanionVisitLabel("CEO")).toBe("동행 · CEO");
  });
});
