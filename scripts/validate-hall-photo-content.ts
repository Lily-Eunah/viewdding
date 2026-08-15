import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { photosForHall } from "../src/data/hall-photos";
import hallPhotoBackfillOverrides from "./data/hall-photo-backfill-overrides";
import hallPhotoReviewOverridesJson from "./data/hall-photo-review-overrides.generated.json";

interface ContentValidationResult {
  hallId: string;
  url: string;
  bytes: number;
  sha256: string | null;
  valid: boolean;
  error: string | null;
}

const targetHallIds = new Set([
  ...Object.keys(hallPhotoBackfillOverrides),
  ...Object.keys(hallPhotoReviewOverridesJson),
]);
const work = [...targetHallIds].flatMap((hallId) =>
  photosForHall(hallId).map((photo) => ({ hallId, url: photo.url })),
);
const results: ContentValidationResult[] = [];
const workers = Array.from({ length: 8 }, async () => {
  while (work.length > 0) {
    const photo = work.shift();
    if (!photo) return;

    try {
      const response = await fetch(photo.url, {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; ViewddingPhotoValidation/1.0)",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const bytes = Buffer.from(await response.arrayBuffer());
      results.push({
        ...photo,
        bytes: bytes.length,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        valid: bytes.length >= 2_048,
        error: null,
      });
    } catch (error) {
      results.push({
        ...photo,
        bytes: 0,
        sha256: null,
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});
await Promise.all(workers);

results.sort((left, right) => left.hallId.localeCompare(right.hallId));
await writeFile(
  path.join(
    process.cwd(),
    "scripts",
    "data",
    "hall-photo-browser-image-validation.generated.json",
  ),
  `${JSON.stringify(results, null, 2)}\n`,
  "utf8",
);

const hallIdsByHash = new Map<string, string[]>();
for (const result of results) {
  if (!result.sha256) continue;
  const hallIds = hallIdsByHash.get(result.sha256) ?? [];
  hallIds.push(result.hallId);
  hallIdsByHash.set(result.sha256, hallIds);
}
const duplicateHashes = [...hallIdsByHash.entries()]
  .filter(([, hallIds]) => hallIds.length > 1)
  .map(([sha256, hallIds]) => ({ sha256, hallIds }));
const invalid = results.filter((result) => !result.valid);

console.log(
  JSON.stringify(
    {
      checked: results.length,
      valid: results.length - invalid.length,
      invalid,
      duplicateHashes,
    },
    null,
    2,
  ),
);

if (invalid.length > 0 || duplicateHashes.length > 0) process.exitCode = 1;
