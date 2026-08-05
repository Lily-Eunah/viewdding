import hallsJson from "@/data/halls.generated.json";
import metadataJson from "@/data/metadata.generated.json";
import type { HallRecord } from "@/domain/types";

export const halls = hallsJson as HallRecord[];
export const metadata = metadataJson;
export const districts = metadata.districts;

export function getHall(id: string): HallRecord | undefined {
  return halls.find((hall) => hall.id === id);
}
