import hallsJson from "@/data/halls.generated.json";
import hallVenueGeocodesJson from "@/data/hall-venue-geocodes.generated.json";
import { photosForHall } from "@/data/hall-photos";
import metadataJson from "@/data/metadata.generated.json";
import { regionDisplayName, resolveRegion, SIDO_OPTIONS } from "@/domain/regions";
import type { HallRecord, Sido } from "@/domain/types";

type GeneratedHallRecord = Omit<HallRecord, "photos" | "sido" | "sigungu" | "subdistrict" | "regionCode" | "metroArea">
  & Partial<Pick<HallRecord, "sido" | "sigungu" | "subdistrict" | "regionCode" | "metroArea">>;
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

export const halls: HallRecord[] = (hallsJson as GeneratedHallRecord[]).map((hall) => {
  const geocode = hallVenueGeocodes[hall.venueId];
  const locationAddress = geocode?.sourceAddress ?? geocode?.matchedAddress ?? hall.address;
  const region = resolveRegion(locationAddress, geocode?.district ?? hall.district);
  if (!region) throw new Error(`지역을 정규화할 수 없습니다: ${hall.id} (${locationAddress ?? hall.district})`);
  return {
    ...hall,
    ...region,
    district: regionDisplayName(region),
    latitude: geocode?.latitude ?? null,
    longitude: geocode?.longitude ?? null,
    locationAddress,
    locationPlaceUrl: geocode?.placeUrl ?? hall.mapUrl,
    locationCheckedAt: geocode?.checkedAt ?? null,
    locationSourceUrl: geocode?.sourceUrl ?? null,
    locationSourceType: geocode?.sourceType ?? null,
    photos: photosForHall(hall.id),
  };
});
export const metadata = metadataJson;
export const districts = metadata.districts;
export const seoulHalls = halls.filter((hall) => hall.id.startsWith("H-SEO-"));
export const gyeonggiHalls = halls.filter((hall) => hall.id.startsWith("H-GG-"));
export const incheonHalls = halls.filter((hall) => hall.id.startsWith("H-IC-"));
export const availableSidos = SIDO_OPTIONS
  .map((option) => option.value)
  .filter((sido) => halls.some((hall) => hall.sido === sido));
export const sigunguBySido = Object.fromEntries(
  SIDO_OPTIONS.map(({ value }) => [
    value,
    Array.from(new Set(halls.filter((hall) => hall.sido === value).map((hall) => hall.sigungu)))
      .sort((a, b) => a.localeCompare(b, "ko")),
  ]),
) as Record<Sido, string[]>;
export const metroAreas = Array.from(new Set(halls.map((hall) => hall.metroArea)))
  .sort((a, b) => a.localeCompare(b, "ko"));

export function getHall(id: string): HallRecord | undefined {
  return halls.find((hall) => hall.id === id);
}
