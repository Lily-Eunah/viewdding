import type { GatheringPurpose } from "./restaurant-types";

export type RestaurantEvidenceSourceRow = Record<string, unknown>;
export type SponsorshipStatus = "yes" | "no" | "unknown";

export interface RestaurantEvidenceRecord {
  id: string;
  restaurantSourceId: string;
  purpose: GatheringPurpose | null;
  purposeLabel: string | null;
  keyword: string | null;
  sourceType: string;
  title: string | null;
  url: string;
  publishedAt: string | null;
  summary: string | null;
  platform: string | null;
  sponsored: SponsorshipStatus;
  confidence: string | null;
  duplicateGroup: string | null;
  collectedAt: string | null;
  companionTypes: string[];
}

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized || null;
}

function purpose(value: unknown): GatheringPurpose | null {
  const normalized = text(value);
  if (normalized && /^(청모|청첩장)/.test(normalized)) return "invitation";
  if (normalized?.startsWith("상견례")) return "family_meeting";
  return null;
}

function sponsorship(value: unknown): SponsorshipStatus {
  const normalized = text(value)?.toLowerCase();
  if (!normalized) return "unknown";
  if (["false", "no", "n", "0", "비협찬", "내돈내산"].includes(normalized)) return "no";
  if (["true", "yes", "y", "1", "협찬", "광고"].includes(normalized)) return "yes";
  return "unknown";
}

function validHttpUrl(value: unknown): string | null {
  const normalized = text(value);
  if (!normalized) return null;
  try {
    const url = new URL(normalized);
    return url.protocol === "http:" || url.protocol === "https:" ? normalized : null;
  } catch {
    return null;
  }
}

function companionTypes(value: unknown): string[] {
  return (text(value) ?? "")
    .split(/[,·|/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeRestaurantEvidenceRow(
  row: RestaurantEvidenceSourceRow,
): RestaurantEvidenceRecord | null {
  const id = text(row.evidence_id);
  const restaurantSourceId = text(row.restaurant_id);
  const normalizedPurpose = purpose(row.purpose);
  const purposeLabel = text(row.purpose);
  const sourceType = text(row.source_type);
  const url = validHttpUrl(row.source_url);
  if (!id || !restaurantSourceId || !sourceType || !url) return null;

  return {
    id,
    restaurantSourceId,
    purpose: normalizedPurpose,
    purposeLabel,
    keyword: text(row.keyword),
    sourceType,
    title: text(row.source_title),
    url,
    publishedAt: text(row.published_at),
    summary: text(row.snippet_summary),
    platform: text(row.author_or_platform),
    sponsored: sponsorship(row.sponsored),
    confidence: text(row.confidence),
    duplicateGroup: text(row.duplicate_group),
    collectedAt: text(row.collected_at),
    companionTypes: companionTypes(row.companion_type),
  };
}

export function isBlogReviewEvidence(evidence: RestaurantEvidenceRecord): boolean {
  if (!/블로그|티스토리/.test(evidence.sourceType) || /미러/.test(evidence.sourceType)) return false;
  try {
    const hostname = new URL(evidence.url).hostname.toLowerCase();
    return !hostname.startsWith("search.");
  } catch {
    return false;
  }
}
