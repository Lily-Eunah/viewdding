import type { PersonalColorRecord } from "./personal-color-types";

export interface MapBounds {
  southWest: { latitude: number; longitude: number };
  northEast: { latitude: number; longitude: number };
}

export function personalColorsWithinBounds(
  vendors: PersonalColorRecord[],
  bounds: MapBounds
): PersonalColorRecord[] {
  return vendors.filter((vendor) => {
    if (vendor.latitude === null || vendor.longitude === null) {
      return false;
    }
    const lat = vendor.latitude;
    const lng = vendor.longitude;
    return (
      lat >= bounds.southWest.latitude &&
      lat <= bounds.northEast.latitude &&
      lng >= bounds.southWest.longitude &&
      lng <= bounds.northEast.longitude
    );
  });
}
