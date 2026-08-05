export interface KakaoAddressDocument {
  address_name: string;
  x: string;
  y: string;
  road_address?: { address_name?: string | null } | null;
}

export interface RestaurantGeocode {
  latitude: number;
  longitude: number;
  matchedAddress: string;
  query: string;
}

export function normalizeAddressKey(address: string): string {
  return address.trim().replace(/\s+/g, " ").toLowerCase();
}

export function geocodeAddressCandidates(address: string): string[] {
  const normalized = address.trim().replace(/\s+/g, " ");
  const roadAddress = normalized.match(/^(.+?(?:로|길)\s+\d+(?:-\d+)?)(?:\s|$)/)?.[1];
  const lotAddress = normalized.match(/^(.+?(?:동|읍|면|리)\s+\d+(?:-\d+)?)(?:\s|$)/)?.[1];
  return Array.from(new Set([normalized, roadAddress, lotAddress].filter((value): value is string => Boolean(value))));
}

export function restaurantGeocodeFromDocument(
  document: KakaoAddressDocument,
  query: string,
): RestaurantGeocode | null {
  const latitude = Number(document.y);
  const longitude = Number(document.x);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return {
    latitude,
    longitude,
    matchedAddress: document.road_address?.address_name?.trim() || document.address_name.trim(),
    query,
  };
}
