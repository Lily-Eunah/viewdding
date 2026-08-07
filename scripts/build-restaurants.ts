import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import {
  geocodeAddressCandidates,
  normalizeAddressKey,
  restaurantGeocodeFromDocument,
  type KakaoAddressDocument,
  type RestaurantGeocode,
} from "../src/domain/restaurant-geocoding";
import {
  normalizeRestaurantEvidenceRow,
  type RestaurantEvidenceRecord,
  type RestaurantEvidenceSourceRow,
} from "../src/domain/restaurant-evidence";
import { normalizeRestaurantRow, type RestaurantSourceRow } from "../src/domain/restaurant-normalization";
import type { RestaurantRecord } from "../src/domain/restaurant-types";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectRoot);
const spreadsheetId = process.env.VIEWDDING_RESTAURANT_SHEET_ID ?? "1-aC-dMvSfVnBfzpTuqY2tWwzgdJ15aBoZ6KOomvJZD4";
const sheetName = process.env.VIEWDDING_RESTAURANT_SHEET_NAME ?? "Restaurants";
const evidenceSheetName = process.env.VIEWDDING_RESTAURANT_EVIDENCE_SHEET_NAME ?? "Evidence";
const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY?.trim() ?? "";
const outputPath = path.join(projectRoot, "src", "data", "restaurants.generated.json");
const metadataPath = path.join(projectRoot, "src", "data", "restaurant-metadata.generated.json");
const evidenceOutputPath = path.join(projectRoot, "src", "data", "restaurant-evidence.generated.json");
const geocodeCachePath = path.join(projectRoot, "src", "data", "restaurant-geocodes.generated.json");

interface GeocodeCacheEntry extends RestaurantGeocode {
  provider: "kakao";
  updatedAt: string;
}

type GeocodeCache = Record<string, GeocodeCacheEntry>;

class KakaoGeocodeError extends Error {
  constructor(public readonly status: number) {
    super(`Kakao 주소 검색에 실패했습니다: ${status}`);
  }
}

function parseCsv(contents: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];
    const next = contents[index + 1];
    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }
  return rows;
}

function objectsFromCsv<T extends Record<string, unknown>>(contents: string): T[] {
  const [headers, ...rows] = parseCsv(contents);
  if (!headers) return [];
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header.trim(), values[index] ?? ""]))) as T[];
}

async function fetchSheetRows<T extends Record<string, unknown>>(tabName: string, range: string): Promise<T[]> {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&range=${encodeURIComponent(range)}&headers=1`;
  const response = await fetch(csvUrl);
  if (!response.ok) throw new Error(`Google Sheet ${tabName} 데이터를 가져오지 못했습니다: ${response.status}`);
  return objectsFromCsv<T>(await response.text());
}

async function loadGeocodeCache(): Promise<GeocodeCache> {
  try {
    return JSON.parse(await fs.readFile(geocodeCachePath, "utf8")) as GeocodeCache;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

async function geocodeAddress(address: string): Promise<RestaurantGeocode | null> {
  for (const query of geocodeAddressCandidates(address)) {
    const url = new URL("https://dapi.kakao.com/v2/local/search/address.json");
    url.searchParams.set("query", query);
    url.searchParams.set("size", "1");
    const response = await fetch(url, {
      headers: { Authorization: `KakaoAK ${kakaoRestApiKey}` },
    });
    if (!response.ok) throw new KakaoGeocodeError(response.status);
    const payload = await response.json() as { documents?: KakaoAddressDocument[] };
    const result = payload.documents?.[0]
      ? restaurantGeocodeFromDocument(payload.documents[0], query)
      : null;
    if (result) return result;
  }
  return null;
}

const [sourceRows, evidenceSourceRows] = await Promise.all([
  fetchSheetRows<RestaurantSourceRow>(sheetName, "A1:AI1000"),
  fetchSheetRows<RestaurantEvidenceSourceRow>(evidenceSheetName, "A1:O2000"),
]);
const normalizedRestaurants = sourceRows.flatMap((row) => {
  const restaurant = normalizeRestaurantRow(row);
  return restaurant?.active ? [restaurant] : [];
});
const geocodeCache = await loadGeocodeCache();
let geocodingAvailable = Boolean(kakaoRestApiKey);
let sourceCoordinateCount = 0;
let cachedCoordinateCount = 0;
let geocodedCoordinateCount = 0;

const restaurants: RestaurantRecord[] = [];
for (const restaurant of normalizedRestaurants) {
  if (restaurant.latitude !== null && restaurant.longitude !== null) {
    sourceCoordinateCount += 1;
    restaurants.push(restaurant);
    continue;
  }
  if (!restaurant.address) {
    restaurants.push(restaurant);
    continue;
  }

  const cacheKey = normalizeAddressKey(restaurant.address);
  let geocode: RestaurantGeocode | null = geocodeCache[cacheKey] ?? null;
  if (geocode) {
    cachedCoordinateCount += 1;
  } else if (geocodingAvailable) {
    try {
      geocode = await geocodeAddress(restaurant.address);
      if (geocode) {
        geocodeCache[cacheKey] = {
          ...geocode,
          provider: "kakao",
          updatedAt: new Date().toISOString(),
        };
        geocodedCoordinateCount += 1;
      }
    } catch (error) {
      if (error instanceof KakaoGeocodeError && [401, 403].includes(error.status)) {
        geocodingAvailable = false;
        console.warn("Kakao REST API 키를 확인할 수 없어 기존 좌표만 사용합니다.");
      } else {
        console.warn(`주소 좌표 변환을 건너뜁니다: ${restaurant.address}`);
      }
    }
  }

  restaurants.push(geocode ? {
    ...restaurant,
    latitude: geocode.latitude,
    longitude: geocode.longitude,
  } : restaurant);
}

const activeRestaurantSourceIds = new Set(restaurants.map((restaurant) => restaurant.sourceId));
const evidence: RestaurantEvidenceRecord[] = evidenceSourceRows.flatMap((row) => {
  const record = normalizeRestaurantEvidenceRow(row);
  return record && activeRestaurantSourceIds.has(record.restaurantSourceId) ? [record] : [];
});

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(restaurants, null, 2)}\n`, "utf8");
await fs.writeFile(evidenceOutputPath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
await fs.writeFile(geocodeCachePath, `${JSON.stringify(geocodeCache, null, 2)}\n`, "utf8");
await fs.writeFile(metadataPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  sourceSpreadsheetId: spreadsheetId,
  sourceSheetName: sheetName,
  evidenceSheetName,
  sourceRows: sourceRows.length,
  exportedRestaurants: restaurants.length,
  sourceEvidenceRows: evidenceSourceRows.length,
  exportedEvidence: evidence.length,
  coordinates: {
    fromSheet: sourceCoordinateCount,
    fromCache: cachedCoordinateCount,
    geocodedThisBuild: geocodedCoordinateCount,
    missing: restaurants.filter((restaurant) => restaurant.latitude === null || restaurant.longitude === null).length,
  },
  districts: Array.from(new Set(restaurants.map((restaurant) => restaurant.district))).sort((a, b) => a.localeCompare(b, "ko")),
}, null, 2)}\n`, "utf8");

console.log(`Generated ${restaurants.length} active restaurants and ${evidence.length} evidence records from Google Sheet`);
