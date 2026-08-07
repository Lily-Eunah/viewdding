import hallsJson from "@/data/halls.generated.json";
import { photosForHall } from "@/data/hall-photos";
import metadataJson from "@/data/metadata.generated.json";
import type { HallRecord } from "@/domain/types";

type GeneratedHallRecord = Omit<HallRecord, "photos">;

export const halls: HallRecord[] = (hallsJson as GeneratedHallRecord[]).map((hall) => ({
  ...hall,
  photos: photosForHall(hall.id),
}));
export const metadata = metadataJson;
export const districts = metadata.districts;

export function getHall(id: string): HallRecord | undefined {
  return halls.find((hall) => hall.id === id);
}
