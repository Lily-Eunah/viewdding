import { writeFile } from "node:fs/promises";
import path from "node:path";
import { photosForHall } from "../src/data/hall-photos";
import hallPhotoBackfillOverrides from "./data/hall-photo-backfill-overrides";
import hallPhotoReviewOverridesJson from "./data/hall-photo-review-overrides.generated.json";

interface ValidationResult {
  hallId: string;
  url: string;
  status: number;
  contentType: string;
  valid: boolean;
  error: string | null;
}

const targetIds = new Set([
  ...Object.keys(hallPhotoBackfillOverrides),
  ...Object.keys(hallPhotoReviewOverridesJson),
]);
const work = [...targetIds].flatMap((hallId) =>
  photosForHall(hallId).map((photo) => ({ hallId, url: photo.url })),
);
const results: ValidationResult[] = [];
const workers = Array.from({ length: 10 }, async () => {
  while (work.length > 0) {
    const photo = work.shift();
    if (!photo) return;
    try {
      const response = await fetch(photo.url, {
        headers: {
          range: "bytes=0-1023",
          "user-agent": "Mozilla/5.0 (compatible; ViewddingPhotoValidation/1.0)",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
      });
      const contentType = response.headers.get("content-type") ?? "";
      const extensionIdentified = /\.(?:avif|jpe?g|png|webp)(?:\?|$)/i.test(
        photo.url,
      );
      await response.body?.cancel();
      results.push({
        ...photo,
        status: response.status,
        contentType,
        valid:
          response.ok &&
          (contentType.toLocaleLowerCase().startsWith("image/") || extensionIdentified),
        error: null,
      });
    } catch (error) {
      results.push({
        ...photo,
        status: 0,
        contentType: "",
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});
await Promise.all(workers);

results.sort((a, b) => a.hallId.localeCompare(b.hallId));
const outputPath = path.join(
  process.cwd(),
  "scripts",
  "data",
  "hall-photo-url-validation.generated.json",
);
await writeFile(outputPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");

const invalid = results.filter((result) => !result.valid);
console.log(
  JSON.stringify(
    {
      checked: results.length,
      valid: results.length - invalid.length,
      invalid: invalid.length,
      failures: invalid,
    },
    null,
    2,
  ),
);
