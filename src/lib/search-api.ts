import type { HallMapBounds, HallMapVenue } from "@/domain/hall-map";
import type { RestaurantMapBounds } from "@/domain/restaurant-map";
import type { FilterState, FilteredHall, Sido } from "@/domain/types";
import type { FilteredRestaurant, GatheringPurpose, RestaurantFilterState, RestaurantRecord } from "@/domain/restaurant-types";

export interface SearchCounts {
  matched: number;
  unknown: number;
  total: number;
}

export interface HallListResponse {
  matched: FilteredHall[];
  unknown: FilteredHall[];
  counts: SearchCounts;
  nextOffset: number | null;
}

export interface HallMapResponse {
  venues: HallMapVenue[];
  counts: SearchCounts;
  shown: number;
  truncated: boolean;
}

export interface RestaurantListResponse {
  matched: FilteredRestaurant[];
  unknown: FilteredRestaurant[];
  counts: SearchCounts;
  nextOffset: number | null;
}

export interface RestaurantMapResponse {
  items: RestaurantRecord[];
  counts: SearchCounts;
  shown: number;
  truncated: boolean;
}

export interface SearchMetaResponse {
  restaurants: {
    districts: Record<GatheringPurpose, string[]>;
    areas: Record<GatheringPurpose, Record<string, string[]>>;
  };
  halls: {
    availableSidos: Sido[];
    sidoVenueCounts: Partial<Record<Sido, number>>;
    regionVenueCounts: Record<string, number>;
  };
}

export const EMPTY_COUNTS: SearchCounts = { matched: 0, unknown: 0, total: 0 };

function appendMany(params: URLSearchParams, key: string, values: string[]) {
  values.forEach((value) => params.append(key, value));
}

export function restaurantFilterParams(filters: RestaurantFilterState): URLSearchParams {
  const params = new URLSearchParams();
  params.set("purpose", filters.purpose);
  if (filters.district) params.set("district", filters.district);
  if (filters.area) params.set("area", filters.area);
  if (filters.weekday) params.set("weekday", filters.weekday);
  appendMany(params, "cuisines", filters.cuisines);
  if (filters.budgetMax !== null) params.set("budget", String(filters.budgetMax));
  if (filters.partySize !== null) params.set("party", String(filters.partySize));
  if (filters.courseOnly) params.set("course", "1");
  if (filters.privateRoomOnly) params.set("room", "1");
  if (filters.parkingOnly) params.set("parking", "1");
  return params;
}

export function hallFilterParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  appendMany(params, "sido", filters.sidos);
  appendMany(params, "region", filters.regionCodes);
  appendMany(params, "types", filters.hallTypes);
  if (filters.guests !== null) params.set("guests", String(filters.guests));
  if (filters.naturalLight) params.set("natural", "1");
  appendMany(params, "ceremony", filters.ceremonyFormats);
  if (filters.intervalAtLeast !== null) params.set("interval", String(filters.intervalAtLeast));
  appendMany(params, "meals", filters.meals);
  return params;
}

function appendBounds(params: URLSearchParams, bounds: HallMapBounds | RestaurantMapBounds | null) {
  if (!bounds) return;
  params.set("south", String(bounds.south));
  params.set("west", String(bounds.west));
  params.set("north", String(bounds.north));
  params.set("east", String(bounds.east));
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { headers: { accept: "application/json" }, signal });
  if (!response.ok) throw new Error(`Search API failed (${response.status})`);
  return response.json() as Promise<T>;
}

export function fetchSearchMeta(signal?: AbortSignal) {
  return fetchJson<SearchMetaResponse>("/api/search/meta", signal);
}

export function fetchRestaurantList(filters: RestaurantFilterState, offset = 0, signal?: AbortSignal) {
  const params = restaurantFilterParams(filters);
  params.set("mode", "list");
  params.set("offset", String(offset));
  params.set("limit", "24");
  return fetchJson<RestaurantListResponse>(`/api/restaurants/search?${params}`, signal);
}

export function fetchRestaurantMap(filters: RestaurantFilterState, bounds: RestaurantMapBounds | null, signal?: AbortSignal) {
  const params = restaurantFilterParams(filters);
  params.set("mode", "map");
  appendBounds(params, bounds);
  return fetchJson<RestaurantMapResponse>(`/api/restaurants/search?${params}`, signal);
}

export function fetchRestaurantCounts(filters: RestaurantFilterState, signal?: AbortSignal) {
  const params = restaurantFilterParams(filters);
  params.set("mode", "count");
  return fetchJson<{ counts: SearchCounts }>(`/api/restaurants/search?${params}`, signal);
}

export function fetchHallList(filters: FilterState, offset = 0, signal?: AbortSignal) {
  const params = hallFilterParams(filters);
  params.set("mode", "list");
  params.set("offset", String(offset));
  params.set("limit", "24");
  return fetchJson<HallListResponse>(`/api/halls/search?${params}`, signal);
}

export function fetchHallMap(filters: FilterState, bounds: HallMapBounds | null, signal?: AbortSignal) {
  const params = hallFilterParams(filters);
  params.set("mode", "map");
  appendBounds(params, bounds);
  return fetchJson<HallMapResponse>(`/api/halls/search?${params}`, signal);
}

export function fetchHallCounts(filters: FilterState, signal?: AbortSignal) {
  const params = hallFilterParams(filters);
  params.set("mode", "count");
  return fetchJson<{ counts: SearchCounts }>(`/api/halls/search?${params}`, signal);
}

export function fetchFavoriteHalls(ids: string[], signal?: AbortSignal) {
  const params = new URLSearchParams({ mode: "favorites" });
  ids.slice(0, 100).forEach((id) => params.append("id", id));
  return fetchJson<{ halls: FilteredHall[] }>(`/api/halls/search?${params}`, signal);
}
