import restaurantData from "@/data/restaurants.generated.json";
import restaurantEvidenceData from "@/data/restaurant-evidence.generated.json";
import restaurantMetadata from "@/data/restaurant-metadata.generated.json";
import type { RestaurantEvidenceRecord } from "@/domain/restaurant-evidence";
import type { RestaurantRecord } from "@/domain/restaurant-types";
import { restaurantSlug } from "@/lib/restaurant-routes";

let restaurantPhotosData: Record<string, { photoUrl?: string | null }> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  restaurantPhotosData = require("@/data/restaurant-photos.generated.json");
} catch {
  restaurantPhotosData = {};
}

export const restaurants: RestaurantRecord[] = (restaurantData as unknown as RestaurantRecord[]).map((restaurant) => ({
  ...restaurant,
  photoUrl: restaurantPhotosData[restaurant.id]?.photoUrl ?? null,
}));
export const restaurantEvidence = restaurantEvidenceData as unknown as RestaurantEvidenceRecord[];
export const metadata = restaurantMetadata;

export function getRestaurantBySlug(slug: string): RestaurantRecord | undefined {
  return restaurants.find((restaurant) => restaurantSlug(restaurant) === slug);
}

export function getRestaurantEvidence(restaurant: RestaurantRecord): RestaurantEvidenceRecord[] {
  return restaurantEvidence.filter((evidence) => (
    evidence.restaurantSourceId === restaurant.sourceId
    && (evidence.purpose === null || evidence.purpose === restaurant.purpose)
  ));
}
