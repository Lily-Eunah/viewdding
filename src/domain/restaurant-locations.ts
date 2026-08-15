import type { RestaurantRecord } from "./restaurant-types";

export function restaurantAreasForDistrict(
  restaurants: RestaurantRecord[],
  district: string,
): string[] {
  const districtRestaurants = district
    ? restaurants.filter((restaurant) => restaurant.district === district)
    : restaurants;
  return Array.from(new Set(
    districtRestaurants
      .flatMap((restaurant) => [restaurant.area, restaurant.nearestStation])
      .filter((location): location is string => Boolean(location)),
  )).sort((a, b) => a.localeCompare(b, "ko"));
}
