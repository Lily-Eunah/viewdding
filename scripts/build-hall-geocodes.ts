import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import hallsJson from "../src/data/halls.generated.json";
import {
  HALL_LOCATION_OVERRIDES,
  type HallLocationSourceType,
} from "../src/data/hall-location-overrides";
import {
  addressMatchesHallRegion,
  coordinatesFromKakao,
  selectKakaoVenueDocument,
  type HallVenueGeocode,
  type KakaoKeywordDocument,
} from "../src/domain/hall-geocoding";
import { resolveRegion, type RegionFields } from "../src/domain/regions";
import {
  geocodeAddressCandidates,
  restaurantGeocodeFromDocument,
  type KakaoAddressDocument,
} from "../src/domain/restaurant-geocoding";
import type { HallRecord } from "../src/domain/types";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectRoot);

const apiKey = process.env.KAKAO_REST_API_KEY?.trim() ?? "";
const outputPath = path.join(projectRoot, "src", "data", "hall-venue-geocodes.generated.json");
const checkedAt = new Date().toISOString().slice(0, 10);

type HallVenueGeocodeCache = Record<string, HallVenueGeocode>;
type GeneratedHall = Omit<HallRecord, "photos">;

interface VenueSeed {
  venueId: string;
  venueName: string;
  district: string;
  region: RegionFields;
  address: string | null;
  sourceUrl: string | null;
  sourceType: HallLocationSourceType | null;
  searchQuery: string | null;
}

class KakaoLocalError extends Error {
  constructor(public readonly status: number) {
    super(`Kakao Local API request failed: ${status}`);
  }
}

async function loadCache(): Promise<HallVenueGeocodeCache> {
  try {
    return JSON.parse(await fs.readFile(outputPath, "utf8")) as HallVenueGeocodeCache;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

async function kakaoRequest<T>(url: URL): Promise<T> {
  const response = await fetch(url, { headers: { Authorization: `KakaoAK ${apiKey}` } });
  if (!response.ok) throw new KakaoLocalError(response.status);
  return response.json() as Promise<T>;
}

async function geocodeAddress(seed: VenueSeed): Promise<HallVenueGeocode | null> {
  if (!seed.address) return null;
  for (const query of geocodeAddressCandidates(seed.address)) {
    const url = new URL("https://dapi.kakao.com/v2/local/search/address.json");
    url.searchParams.set("query", query);
    url.searchParams.set("size", "1");
    const payload = await kakaoRequest<{ documents?: KakaoAddressDocument[] }>(url);
    const result = payload.documents?.[0]
      ? restaurantGeocodeFromDocument(payload.documents[0], query)
      : null;
    if (!result) continue;
    if (!addressMatchesHallRegion(result.matchedAddress, seed.region)) continue;
    return {
      venueId: seed.venueId,
      venueName: seed.venueName,
      district: seed.district,
      latitude: result.latitude,
      longitude: result.longitude,
      matchedAddress: result.matchedAddress,
      matchedPlaceName: null,
      placeUrl: `https://map.kakao.com/?q=${encodeURIComponent(seed.searchQuery ?? seed.venueName)}`,
      query,
      method: "address",
      provider: "kakao",
      checkedAt,
      sourceAddress: seed.address,
      sourceUrl: seed.sourceUrl ?? undefined,
      sourceType: seed.sourceType ?? undefined,
    };
  }
  return null;
}

async function geocodeKeyword(seed: VenueSeed): Promise<HallVenueGeocode | null> {
  const venueSearchName = seed.searchQuery ?? seed.venueName;
  const query = `${venueSearchName} ${seed.district}`;
  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", query);
  url.searchParams.set("size", "5");
  const payload = await kakaoRequest<{ documents?: KakaoKeywordDocument[] }>(url);
  const document = selectKakaoVenueDocument(venueSearchName, seed.region, payload.documents ?? []);
  const coordinates = document ? coordinatesFromKakao(document.x, document.y) : null;
  if (!document || !coordinates) return null;
  return {
    venueId: seed.venueId,
    venueName: seed.venueName,
    district: seed.district,
    ...coordinates,
    matchedAddress: document.road_address_name || document.address_name,
    matchedPlaceName: document.place_name,
    placeUrl: document.place_url,
    query,
    method: "keyword",
    provider: "kakao",
    checkedAt,
    sourceAddress: seed.address ?? undefined,
    sourceUrl: seed.sourceUrl ?? undefined,
    sourceType: seed.sourceType ?? undefined,
  };
}

const venues = Array.from(
  (hallsJson as GeneratedHall[]).reduce((map, hall) => {
    const override = HALL_LOCATION_OVERRIDES[hall.venueId];
    if (!map.has(hall.venueId)) {
      const district = override?.district ?? hall.district;
      const address = override?.address ?? hall.address;
      const region = resolveRegion(address, district);
      if (!region) throw new Error(`지역을 정규화할 수 없습니다: ${hall.venueId} (${address ?? district})`);
      map.set(hall.venueId, {
        venueId: hall.venueId,
        venueName: hall.venueName,
        district,
        region,
        address,
        sourceUrl: override?.sourceUrl ?? null,
        sourceType: override?.sourceType ?? null,
        searchQuery: override?.searchQuery ?? null,
      });
    } else if (!map.get(hall.venueId)?.address && hall.address) {
      map.get(hall.venueId)!.address = hall.address;
    }
    return map;
  }, new Map<string, VenueSeed>()).values(),
);

const cache = await loadCache();
let added = 0;
let missing = 0;
let apiAvailable = Boolean(apiKey);

for (const seed of venues) {
  const cached = cache[seed.venueId];
  const sourceAddressChanged = Boolean(
    cached
    && seed.sourceType
    && cached.sourceAddress !== seed.address,
  );
  const districtChanged = Boolean(cached && cached.district !== seed.district);
  if (sourceAddressChanged || districtChanged) {
    delete cache[seed.venueId];
  } else if (cached) {
    cache[seed.venueId] = {
      ...cached,
      district: seed.district,
      sourceAddress: seed.address ?? cached.sourceAddress,
      sourceUrl: seed.sourceUrl ?? cached.sourceUrl,
      sourceType: seed.sourceType ?? cached.sourceType,
    };
    continue;
  }
  if (!apiAvailable) {
    missing += 1;
    continue;
  }
  try {
    const geocode = await geocodeAddress(seed) ?? await geocodeKeyword(seed);
    if (geocode) {
      cache[seed.venueId] = geocode;
      added += 1;
    } else {
      missing += 1;
    }
  } catch (error) {
    if (error instanceof KakaoLocalError && [401, 403, 429].includes(error.status)) {
      apiAvailable = false;
    }
    missing += 1;
  }
}

const venueIds = new Set(venues.map((venue) => venue.venueId));
const output = Object.fromEntries(
  Object.entries(cache)
    .filter(([venueId]) => venueIds.has(venueId))
    .sort(([left], [right]) => left.localeCompare(right)),
);

await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Prepared ${Object.keys(output).length}/${venues.length} wedding venue coordinates (${added} added, ${missing} unresolved).`);
