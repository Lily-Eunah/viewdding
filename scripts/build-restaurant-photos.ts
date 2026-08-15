import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import type { RestaurantRecord } from "../src/domain/restaurant-types";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectRoot);

const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY?.trim() ?? "";
const restaurantsPath = path.join(projectRoot, "src", "data", "restaurants.generated.json");
const outputPath = path.join(projectRoot, "src", "data", "restaurant-photos.generated.json");

export interface RestaurantPhotoEntry {
  restaurantId: string;
  name: string;
  branch: string | null;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  sourceType: "kakao_place" | "none";
  placeUrl: string | null;
  updatedAt: string;
}

type PhotoCache = Record<string, RestaurantPhotoEntry>;

function extractCleanKakaoPlacePhoto(ogImageUrl: string): string | null {
  if (!ogImageUrl) return null;
  
  // Filter out static map, default placeholder icons
  if (
    ogImageUrl.includes("staticmap") ||
    ogImageUrl.includes("default") ||
    ogImageUrl.includes("map_icon") ||
    ogImageUrl.includes("kakaomap_logo")
  ) {
    return null;
  }

  let url = ogImageUrl;
  if (url.startsWith("//")) {
    url = `https:${url}`;
  }

  // If wrapped in cthumb (?fname=...), extract original full-resolution image URL
  const fnameMatch = url.match(/[?&]fname=([^&]+)/);
  if (fnameMatch) {
    try {
      const decoded = decodeURIComponent(fnameMatch[1]);
      return decoded.startsWith("http://") ? decoded.replace("http://", "https://") : decoded;
    } catch {
      return url;
    }
  }

  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

async function fetchOfficialKakaoPlacePhoto(
  r: RestaurantRecord
): Promise<{ photoUrl: string | null; placeUrl: string | null; sourceType: RestaurantPhotoEntry["sourceType"] }> {
  if (!kakaoRestApiKey) {
    return { photoUrl: null, placeUrl: null, sourceType: "none" };
  }

  const queries = [
    `${r.name} ${r.branch ?? ""}`.trim(),
    `${r.name} ${r.district}`.trim(),
    r.name.trim(),
  ];

  for (const query of queries) {
    try {
      const searchUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`;
      const searchRes = await fetch(searchUrl, {
        headers: {
          Authorization: `KakaoAK ${kakaoRestApiKey}`,
        },
      });

      if (searchRes.ok) {
        const searchData = (await searchRes.json()) as {
          documents?: Array<{ id: string; place_name: string; place_url: string; address_name: string; road_address_name: string }>;
        };

        if (searchData.documents && searchData.documents.length > 0) {
          const doc = searchData.documents.find(
            (d) =>
              d.address_name.includes(r.district) ||
              d.road_address_name.includes(r.district) ||
              (r.branch && d.place_name.includes(r.branch))
          ) ?? searchData.documents[0];

          const placeId = doc.id;
          const placeUrl = doc.place_url;

          // Fetch official place page HTML
          const pageRes = await fetch(`https://place.map.kakao.com/${placeId}`, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            },
          });

          if (pageRes.ok) {
            const html = await pageRes.text();
            const ogMatch =
              html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
              html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);

            if (ogMatch?.[1]) {
              const cleanPhoto = extractCleanKakaoPlacePhoto(ogMatch[1]);
              if (cleanPhoto) {
                return { photoUrl: cleanPhoto, placeUrl, sourceType: "kakao_place" };
              }
            }
          }
        }
      }
    } catch {
      // ignore and try next query
    }
  }

  return { photoUrl: null, placeUrl: null, sourceType: "none" };
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");
  const limitArgIdx = process.argv.indexOf("--limit");
  const limit = limitArgIdx !== -1 ? Number.parseInt(process.argv[limitArgIdx + 1], 10) : null;

  console.log(`Starting official restaurant photo backfill... (dryRun: ${isDryRun}, force: ${force}, limit: ${limit ?? "ALL"})`);

  const raw = await fs.readFile(restaurantsPath, "utf-8");
  const restaurants = JSON.parse(raw) as RestaurantRecord[];

  let existingCache: PhotoCache = {};
  try {
    const cacheRaw = await fs.readFile(outputPath, "utf-8");
    existingCache = JSON.parse(cacheRaw) as PhotoCache;
  } catch {
    existingCache = {};
  }

  const targetList = limit ? restaurants.slice(0, limit) : restaurants;
  const now = new Date().toISOString();
  let successCount = 0;
  let fallbackCount = 0;
  let skipCount = 0;

  for (let i = 0; i < targetList.length; i += 1) {
    const r = targetList[i];
    const key = r.id;

    if (existingCache[key]?.photoUrl && !isDryRun && !force) {
      skipCount += 1;
      continue;
    }

    const { photoUrl, placeUrl, sourceType } = await fetchOfficialKakaoPlacePhoto(r);

    if (photoUrl) {
      successCount += 1;
      console.log(`[${i + 1}/${targetList.length}] Found official photo for ${r.name} (${r.branch ?? ""}): ${photoUrl.slice(0, 65)}...`);
    } else {
      fallbackCount += 1;
      console.log(`[${i + 1}/${targetList.length}] No official photo for ${r.name} (${r.branch ?? ""}) -> Fallback to Brand Visual`);
    }

    existingCache[key] = {
      restaurantId: r.id,
      name: r.name,
      branch: r.branch,
      photoUrl,
      thumbnailUrl: photoUrl,
      sourceType,
      placeUrl,
      updatedAt: now,
    };

    // Polite delay between place page requests
    await new Promise((resolve) => setTimeout(resolve, 60));
  }

  console.log(`Finished. Total: ${targetList.length}, Official Photos: ${successCount}, Brand Graphic Fallbacks: ${fallbackCount}, Skipped: ${skipCount}`);

  if (!isDryRun) {
    await fs.writeFile(outputPath, JSON.stringify(existingCache, null, 2), "utf-8");
    console.log(`Saved clean high-resolution photos to ${outputPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
