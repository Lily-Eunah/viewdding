import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

interface BrowserReviewRow {
  hallId: string;
  venueId: string;
  venueName: string;
  hallName: string;
  query: string;
  result: "candidate" | "confirmed" | "rejected_visual" | "unresolved";
  imageUrl?: string | null;
  sourceUrl?: string | null;
  sourceType?: "public_listing";
  verificationMethod?: "public_named_listing";
  title?: string;
  description?: string;
  postDate?: string | null;
  checkedAt: string;
  selectedFrom?: string | null;
  visualReview?: string;
  verificationNote?: string;
  reason?: string;
  rejectedImageUrl?: string;
}

interface AuditRow {
  hallId: string;
  venueId: string;
  venueName: string;
  hallName: string;
  result: "confirmed" | "needs_review";
  sourceUrl: string | null;
  photoUrl: string | null;
  reason: string;
}

interface PhotoOverride {
  url: string;
  sourceUrl: string;
  note: string;
  checkedAt: string;
  visualReviewPassed: true;
  sourceType: "official_website" | "public_listing";
  usageStatus: "official_source_linked" | "public_source_linked";
  photoKind: "wedding_setup";
  verificationMethod:
    | "official_hall_page"
    | "official_named_gallery"
    | "official_single_hall_venue"
    | "public_named_listing";
}

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "scripts", "data");
const CHECKED_AT = new Date().toISOString().slice(0, 10);

const ACCEPTED_NAVER_HALL_IDS = new Set([
  "H-IC-P1-20260808-014",
  "H-REG-X3-20260809-063",
  "H-REG-X3-20260809-068",
  "H-SEO-20260729-239",
  "H-SEO-20260729-242",
  "H-SEO-20260729-270",
  "H-SEO-20260729-287",
]);

const ACCEPTED_DIRECT_HALL_IDS = new Set([
  "H-REG-X3-20260809-066",
  "H-SEO-20260729-096",
  "H-SEO-20260729-322",
]);

const REJECTED_DIRECT_HALL_IDS = new Map([
  ["H-REG-X3-20260809-032", "Lobby or waiting-area photo; not suitable as a wedding-hall photo."],
  ["H-REG-X3-20260809-054", "Venue logo image; not suitable as a wedding-hall photo."],
  ["H-REG-X3-20260809-062", "Building exterior photo; not suitable as a wedding-hall photo."],
  ["H-SEO-20260730-010", "Couple- or people-dominant photo; not suitable as a hall overview."],
  ["H-SEO-20260730-011", "Couple- or people-dominant photo; not suitable as a hall overview."],
]);

const naverRows = JSON.parse(
  await readFile(path.join(DATA_DIR, "hall-photo-naver-audit.generated.json"), "utf8"),
) as BrowserReviewRow[];
const existingReviewRows = JSON.parse(
  await readFile(path.join(DATA_DIR, "hall-photo-browser-review.generated.json"), "utf8"),
) as BrowserReviewRow[];
const auditRows = JSON.parse(
  await readFile(path.join(ROOT, "src", "data", "hall-photo-audit.generated.json"), "utf8"),
) as AuditRow[];
const existingVisualRejections = JSON.parse(
  await readFile(
    path.join(ROOT, "src", "data", "hall-photo-visual-rejections.generated.json"),
    "utf8",
  ),
) as Array<{
  hallId: string;
  url: string;
  sourceUrl: string | null;
  reason: string;
  checkedAt: string;
}>;

const finalizedRows = naverRows.map((row): BrowserReviewRow => {
  if (row.result !== "candidate") {
    return { ...row, visualReview: "no_named_recent_post" };
  }

  if (ACCEPTED_NAVER_HALL_IDS.has(row.hallId)) {
    return {
      ...row,
      result: "confirmed",
      selectedFrom: "representative",
      visualReview: "hall_space_confirmed",
      verificationNote:
        "Manually verified that the recent hall-named post shows the aisle, stage, guest seating, or full wedding setup.",
    };
  }

  return {
    ...row,
    result: "rejected_visual",
    rejectedImageUrl: row.imageUrl ?? undefined,
    imageUrl: null,
    selectedFrom: null,
    visualReview: "rejected_non_hall_or_people_dominant",
    reason:
      "Manual image review found people, food, exterior, logo, decorative detail, or a non-ceremony space dominating the candidate.",
  };
});

const mergedReviewRows = [
  ...new Map(
    [...existingReviewRows, ...finalizedRows].map((row) => [row.hallId, row]),
  ).values(),
].sort((left, right) => left.hallId.localeCompare(right.hallId));

const auditByHallId = new Map(auditRows.map((row) => [row.hallId, row]));
const reviewOverrides: Record<string, PhotoOverride> = {};

for (const row of finalizedRows) {
  if (row.result !== "confirmed" || !row.imageUrl || !row.sourceUrl) continue;
  reviewOverrides[row.hallId] = {
    url: row.imageUrl,
    sourceUrl: row.sourceUrl,
    note: `${row.venueName} ${row.hallName}: manually verified a recent, hall-named wedding-space photo.`,
    checkedAt: row.checkedAt,
    visualReviewPassed: true,
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    photoKind: "wedding_setup",
    verificationMethod: "public_named_listing",
  };
}

for (const hallId of ACCEPTED_DIRECT_HALL_IDS) {
  const row = auditByHallId.get(hallId);
  if (!row?.photoUrl || !row.sourceUrl || row.result !== "confirmed") {
    throw new Error(`Missing accepted direct candidate for ${hallId}`);
  }
  const official = !/yozmwedding|directwedding|weddingbook|choicehalls|thewedd/i.test(
    row.sourceUrl,
  );
  reviewOverrides[hallId] = {
    url: row.photoUrl,
    sourceUrl: row.sourceUrl,
    note: `${row.venueName} ${row.hallName}: manually verified a wide wedding-setup photo without people dominating the image.`,
    checkedAt: CHECKED_AT,
    visualReviewPassed: true,
    sourceType: official ? "official_website" : "public_listing",
    usageStatus: official ? "official_source_linked" : "public_source_linked",
    photoKind: "wedding_setup",
    verificationMethod: official ? "official_hall_page" : "public_named_listing",
  };
}

const visualRejections = [
  ...existingVisualRejections,
  ...finalizedRows
    .filter((row) => row.result === "rejected_visual" && row.rejectedImageUrl)
    .map((row) => ({
      hallId: row.hallId,
      url: row.rejectedImageUrl as string,
      sourceUrl: row.sourceUrl ?? null,
      reason: row.reason ?? "Rejected after manual visual review.",
      checkedAt: row.checkedAt,
    })),
];

for (const [hallId, reason] of REJECTED_DIRECT_HALL_IDS) {
  const row = auditByHallId.get(hallId);
  if (!row?.photoUrl) continue;
  visualRejections.push({
    hallId,
    url: row.photoUrl,
    sourceUrl: row.sourceUrl,
    reason,
    checkedAt: CHECKED_AT,
  });
}

const deduplicatedVisualRejections = [
  ...new Map(visualRejections.map((entry) => [entry.url, entry])).values(),
].sort((left, right) =>
  left.hallId.localeCompare(right.hallId) || left.url.localeCompare(right.url),
);

await Promise.all([
  writeFile(
    path.join(DATA_DIR, "hall-photo-browser-review.generated.json"),
    `${JSON.stringify(mergedReviewRows, null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    path.join(DATA_DIR, "hall-photo-review-overrides.generated.json"),
    `${JSON.stringify(reviewOverrides, null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    path.join(ROOT, "src", "data", "hall-photo-visual-rejections.generated.json"),
    `${JSON.stringify(deduplicatedVisualRejections, null, 2)}\n`,
    "utf8",
  ),
]);

console.log(
  JSON.stringify(
    {
      reviewed: finalizedRows.length,
      confirmed: finalizedRows.filter((row) => row.result === "confirmed").length,
      rejectedVisual: finalizedRows.filter((row) => row.result === "rejected_visual").length,
      unresolved: finalizedRows.filter((row) => row.result === "unresolved").length,
      overrides: Object.keys(reviewOverrides).length,
      rejectedAssets: deduplicatedVisualRejections.length,
    },
    null,
    2,
  ),
);
