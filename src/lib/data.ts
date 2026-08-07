import hallsJson from "@/data/halls.generated.json";
import hallVenueGeocodesJson from "@/data/hall-venue-geocodes.generated.json";
import { photosForHall } from "@/data/hall-photos";
import metadataJson from "@/data/metadata.generated.json";
import type { HallRecord } from "@/domain/types";

type GeneratedHallRecord = Omit<HallRecord, "photos">;
type HallVenueGeocode = {
  latitude: number;
  longitude: number;
  matchedAddress: string;
  placeUrl: string;
  checkedAt: string;
};

const hallVenueGeocodes = hallVenueGeocodesJson as Record<string, HallVenueGeocode>;

export const halls: HallRecord[] = (hallsJson as GeneratedHallRecord[]).map((hall) => ({
  ...hall,
  latitude: hallVenueGeocodes[hall.venueId]?.latitude ?? null,
  longitude: hallVenueGeocodes[hall.venueId]?.longitude ?? null,
  locationAddress: hallVenueGeocodes[hall.venueId]?.matchedAddress ?? hall.address,
  locationPlaceUrl: hallVenueGeocodes[hall.venueId]?.placeUrl ?? hall.mapUrl,
  locationCheckedAt: hallVenueGeocodes[hall.venueId]?.checkedAt ?? null,
  photos: photosForHall(hall.id),
}));
export const metadata = metadataJson;
export const districts = metadata.districts;

export function getHall(id: string): HallRecord | undefined {
  return halls.find((hall) => hall.id === id);
}
