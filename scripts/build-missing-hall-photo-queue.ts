import { writeFile } from "node:fs/promises";
import path from "node:path";
import hallsJson from "../src/data/halls.generated.json";
import { photosForHall } from "../src/data/hall-photos";
import type { HallRecord } from "../src/domain/types";

interface MissingHallPhotoQueueRow {
  hallId: string;
  venueId: string;
  venueName: string;
  hallName: string;
  sido: string;
  sigungu: string;
  publicStatus: string;
  hallNameStatus: HallRecord["hallNameStatus"] | null;
  venueHallCount: number;
  officialWebsite: string | null;
  officialInstagram: string | null;
  hallNameSourceUrl: string | null;
  priority: 1 | 2 | 3;
  reviewStatus: "pending";
  recommendedQueries: string[];
}

const halls = hallsJson as HallRecord[];
const publicHalls = halls.filter((hall) => hall.publicStatus === "public");
const hallCountByVenueId = publicHalls.reduce<Map<string, number>>((counts, hall) => {
  counts.set(hall.venueId, (counts.get(hall.venueId) ?? 0) + 1);
  return counts;
}, new Map());

function priorityFor(hall: HallRecord, venueHallCount: number): 1 | 2 | 3 {
  if (hall.website && hall.hallNameStatus === "official") return 1;
  if (hall.website || hall.instagram || (hall.hallNameStatus === "official" && venueHallCount === 1)) return 2;
  return 3;
}

const queue: MissingHallPhotoQueueRow[] = publicHalls
  .filter((hall) => photosForHall(hall.id).length === 0)
  .map((hall) => {
    const venueHallCount = hallCountByVenueId.get(hall.venueId) ?? 1;
    return {
      hallId: hall.id,
      venueId: hall.venueId,
      venueName: hall.venueName,
      hallName: hall.hallName,
      sido: hall.sido,
      sigungu: hall.sigungu,
      publicStatus: hall.publicStatus,
      hallNameStatus: hall.hallNameStatus ?? null,
      venueHallCount,
      officialWebsite: hall.website,
      officialInstagram: hall.instagram,
      hallNameSourceUrl: hall.hallNameSourceUrl ?? null,
      priority: priorityFor(hall, venueHallCount),
      reviewStatus: "pending" as const,
      recommendedQueries: [
        `"${hall.venueName}" "${hall.hallName}" 공식`,
        `"${hall.venueName}" "${hall.hallName}" 웨딩`,
        `"${hall.venueName}" "${hall.hallName}" 인스타그램`,
      ],
    };
  })
  .sort((a, b) =>
    a.priority - b.priority
    || a.sido.localeCompare(b.sido, "ko")
    || a.sigungu.localeCompare(b.sigungu, "ko")
    || a.venueName.localeCompare(b.venueName, "ko")
    || a.hallName.localeCompare(b.hallName, "ko"),
  );

const outputPath = path.join(
  process.cwd(),
  "scripts",
  "data",
  "missing-hall-photo-queue.generated.json",
);

await writeFile(outputPath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
console.log(`Generated ${queue.length} missing hall photo queue rows at ${outputPath}`);
