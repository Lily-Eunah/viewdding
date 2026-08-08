import hallsJson from "@/data/halls.generated.json";
import hallVenueGeocodesJson from "@/data/hall-venue-geocodes.generated.json";
import { photosForHall } from "@/data/hall-photos";
import metadataJson from "@/data/metadata.generated.json";
import type { HallRecord } from "@/domain/types";

type GeneratedHallRecord = Omit<HallRecord, "photos">;
type HallVenueGeocode = {
  district: string;
  latitude: number;
  longitude: number;
  matchedAddress: string;
  sourceAddress?: string;
  placeUrl: string;
  checkedAt: string;
  sourceUrl?: string;
  sourceType?: string;
};

const hallVenueGeocodes = hallVenueGeocodesJson as Record<string, HallVenueGeocode>;

export const halls: HallRecord[] = (hallsJson as GeneratedHallRecord[]).map((hall) => ({
  ...hall,
  district: hallVenueGeocodes[hall.venueId]?.district ?? hall.district,
  latitude: hallVenueGeocodes[hall.venueId]?.latitude ?? null,
  longitude: hallVenueGeocodes[hall.venueId]?.longitude ?? null,
  locationAddress: hallVenueGeocodes[hall.venueId]?.sourceAddress
    ?? hallVenueGeocodes[hall.venueId]?.matchedAddress
    ?? hall.address,
  locationPlaceUrl: hallVenueGeocodes[hall.venueId]?.placeUrl ?? hall.mapUrl,
  locationCheckedAt: hallVenueGeocodes[hall.venueId]?.checkedAt ?? null,
  locationSourceUrl: hallVenueGeocodes[hall.venueId]?.sourceUrl ?? null,
  locationSourceType: hallVenueGeocodes[hall.venueId]?.sourceType ?? null,
  photos: photosForHall(hall.id),
}));
export const metadata = metadataJson;
export const districts = metadata.districts;
export const seoulHalls = halls.filter((hall) => hall.id.startsWith("H-SEO-"));
export const gyeonggiHalls = halls.filter((hall) => hall.id.startsWith("H-GG-"));
export const seoulDistricts = Array.from(new Set(seoulHalls.map((hall) => hall.district))).sort((a, b) => a.localeCompare(b, "ko"));
export const gyeonggiDistricts = Array.from(new Set(gyeonggiHalls.map((hall) => hall.district))).sort((a, b) => a.localeCompare(b, "ko"));

export function getHall(id: string): HallRecord | undefined {
  return halls.find((hall) => hall.id === id);
}
