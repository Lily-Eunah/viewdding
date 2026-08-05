import restaurantData from "@/data/restaurants.generated.json";
import restaurantMetadata from "@/data/restaurant-metadata.generated.json";
import type { RestaurantRecord } from "@/domain/restaurant-types";

export const restaurants = restaurantData as unknown as RestaurantRecord[];
export const metadata = restaurantMetadata;
