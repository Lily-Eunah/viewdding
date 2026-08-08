import type { MetadataRoute } from "next";
import { halls, metadata as hallMetadata } from "@/lib/data";
import { hallSeoPath, type HallSeoCollectionKey } from "@/lib/hall-seo";
import { restaurantSlug } from "@/lib/restaurant-routes";
import { metadata as restaurantMetadata, restaurants } from "@/lib/restaurants";

const BASE_URL = "https://viewdding.com";
const COLLECTION_KEYS: HallSeoCollectionKey[] = ["all", "bright", "dark", "chapel", "outdoor"];

export const dynamic = "force-static";

function absolute(path: string): string {
  return `${BASE_URL}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absolute("/"), lastModified: hallMetadata.generatedAt, changeFrequency: "weekly", priority: 1 },
    { url: absolute("/search/"), lastModified: hallMetadata.generatedAt, changeFrequency: "weekly", priority: 0.8 },
    { url: absolute("/gatherings/"), lastModified: restaurantMetadata.generatedAt, changeFrequency: "weekly", priority: 0.8 },
    { url: absolute("/methodology/"), lastModified: hallMetadata.generatedAt, changeFrequency: "monthly", priority: 0.4 },
  ];
  const collectionPages: MetadataRoute.Sitemap = COLLECTION_KEYS.map((key) => ({
    url: absolute(hallSeoPath(key)),
    lastModified: hallMetadata.generatedAt,
    changeFrequency: "weekly",
    priority: key === "all" ? 0.95 : 0.9,
  }));
  const hallPages: MetadataRoute.Sitemap = halls.map((hall) => ({
    url: absolute(`/halls/${hall.id}/`),
    lastModified: hall.detailCheckedAt ?? hall.classificationCheckedAt ?? hall.locationCheckedAt ?? hallMetadata.generatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  const restaurantPages: MetadataRoute.Sitemap = restaurants.map((restaurant) => ({
    url: absolute(`/restaurants/${restaurantSlug(restaurant)}/`),
    lastModified: restaurant.verifiedAt ?? restaurantMetadata.generatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...collectionPages, ...hallPages, ...restaurantPages];
}
