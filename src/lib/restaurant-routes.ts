import type { RestaurantRecord } from "@/domain/restaurant-types";

export function restaurantSlug(restaurant: Pick<RestaurantRecord, "sourceId" | "purpose">): string {
  return `${restaurant.sourceId.toLowerCase()}-${restaurant.purpose}`;
}
