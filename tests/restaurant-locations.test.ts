import { describe, expect, it } from "vitest";
import { restaurantAreasForDistrict } from "../src/domain/restaurant-locations";
import type { RestaurantRecord } from "../src/domain/restaurant-types";

describe("restaurant location options", () => {
  it("returns only areas and stations from the selected district", () => {
    const restaurants = [
      { district: "강남구", area: "역삼", nearestStation: "강남역" },
      { district: "마포구", area: "연남", nearestStation: "홍대입구역" },
    ] as RestaurantRecord[];

    expect(restaurantAreasForDistrict(restaurants, "강남구")).toEqual(["강남역", "역삼"]);
    expect(restaurantAreasForDistrict(restaurants, "")).toEqual(["강남역", "역삼", "연남", "홍대입구역"]);
  });
});
