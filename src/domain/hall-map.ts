import type { FilteredHall, HallRecord } from "./types";

export interface HallMapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface HallMapVenue {
  venueId: string;
  venueName: string;
  district: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  placeUrl: string | null;
  halls: FilteredHall[];
}

export function groupFilteredHallsByVenue(items: FilteredHall[]): HallMapVenue[] {
  const venues = new Map<string, HallMapVenue>();
  for (const item of items) {
    const hall = item.hall;
    const existing = venues.get(hall.venueId);
    if (existing) {
      existing.halls.push(item);
      continue;
    }
    venues.set(hall.venueId, {
      venueId: hall.venueId,
      venueName: hall.venueName,
      district: hall.district,
      address: hall.locationAddress ?? hall.address,
      latitude: hall.latitude ?? null,
      longitude: hall.longitude ?? null,
      placeUrl: hall.locationPlaceUrl ?? hall.mapUrl,
      halls: [item],
    });
  }
  return Array.from(venues.values()).sort((left, right) => (
    left.district.localeCompare(right.district, "ko")
    || left.venueName.localeCompare(right.venueName, "ko")
  ));
}

export function hallMapVenuesWithinBounds(
  venues: HallMapVenue[],
  bounds: HallMapBounds,
): HallMapVenue[] {
  return venues.filter((venue) => {
    if (venue.latitude === null || venue.longitude === null) return false;
    return venue.latitude >= bounds.south
      && venue.latitude <= bounds.north
      && venue.longitude >= bounds.west
      && venue.longitude <= bounds.east;
  });
}

export function hallCapacitySummary(hall: HallRecord): string | null {
  const seated = hall.seated.max;
  const capacity = hall.capacity.max;
  if (seated !== null && capacity !== null) {
    return seated === capacity ? `최대 ${capacity.toLocaleString("ko-KR")}명` : `착석 ${seated.toLocaleString("ko-KR")}명 · 최대 ${capacity.toLocaleString("ko-KR")}명`;
  }
  if (capacity !== null) return `최대 ${capacity.toLocaleString("ko-KR")}명`;
  if (seated !== null) return `착석 ${seated.toLocaleString("ko-KR")}명`;
  return null;
}
