import type { RestaurantRecord } from "./restaurant-types";

export interface RestaurantMapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export function restaurantsWithinBounds(
  restaurants: RestaurantRecord[],
  bounds: RestaurantMapBounds,
): RestaurantRecord[] {
  return restaurants.filter((restaurant) => {
    if (restaurant.latitude === null || restaurant.longitude === null) return false;
    return restaurant.latitude >= bounds.south
      && restaurant.latitude <= bounds.north
      && restaurant.longitude >= bounds.west
      && restaurant.longitude <= bounds.east;
  });
}
