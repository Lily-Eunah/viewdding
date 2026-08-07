import { describe, expect, it } from "vitest";
import { restaurantsWithinBounds } from "../src/domain/restaurant-map";
import type { RestaurantRecord } from "../src/domain/restaurant-types";

describe("restaurant map bounds", () => {
  it("keeps only restaurants inside the visible map bounds", () => {
    const restaurants = [
      { id: "inside", latitude: 37.5, longitude: 127.0 },
      { id: "outside", latitude: 37.7, longitude: 127.0 },
      { id: "missing", latitude: null, longitude: null },
    ] as RestaurantRecord[];

    expect(restaurantsWithinBounds(restaurants, {
      south: 37.4,
      west: 126.9,
      north: 37.6,
      east: 127.1,
    }).map((restaurant) => restaurant.id)).toEqual(["inside"]);
  });
});
