import { writeFile } from "node:fs/promises";
import path from "node:path";
import hallsJson from "../src/data/halls.generated.json";
import { hallPhotosByHallId } from "../src/data/hall-photos";
import type {
  HallPhoto,
  HallPhotoVerificationMethod,
} from "../src/domain/types";

const ROOT = process.cwd();
const CHECKED_AT = new Date().toISOString().slice(0, 10);
const PUBLIC_HOSTS = [
  "yozmwedding.co.kr",
  "thewedd.com",
  "weddingcrowd.kr",
  "directwedding.co.kr",
  "weddingfriendz.com",
  "myweddingfriendz.com",
  "iwedding.co.kr",
  "weddingbook.com",
];
const IMAGE_KEYWORDS = [
  "웨딩홀",
  "예식홀",
  "메인 전경",
  "내부 전경",
  "홀 전경",
  "버진로드",
  "단상",
  "무대 전경",
  "wedding hall",
  "ballroom",
  "chapel",
  "garden",
];
const EXCLUDED_IMAGE_KEYWORDS = [
  "예약 상담",
  "신부대기실",
  "브라이덜룸",
  "폐백실",
  "연회장",
  "뷔페",
  "음식",
  "로비",
  "외관",
  "주차",
  "지도",
  "logo",
  "로고",
  "icon",
];

type Hall = (typeof hallsJson)[number];

interface ImageCandidate {
  url: string;
  alt: string;
  context: string;
}

interface ReplacementSeed {
  hallId: string;
  url: string;
  sourceUrl: string;
  sourceType: HallPhoto["sourceType"];
  usageStatus: HallPhoto["usageStatus"];
  photoKind: HallPhoto["photoKind"];
  checkedAt: string;
}

interface VerificationEntry {
  identityStatus: "hall_confirmed";
  verificationMethod: HallPhotoVerificationMethod;
  verificationNote: string;
}

interface AuditResult {
  hallId: string;
  venueId: string;
  venueName: string;
  hallName: string;
  result: "confirmed" | "needs_review";
  sourceUrl: string | null;
  photoUrl: string | null;
  reason: string;
}

const venueCounts = new Map<string, number>();
for (const hall of hallsJson) {
  venueCounts.set(hall.venueId, (venueCounts.get(hall.venueId) ?? 0) + 1);
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("ko")
    .replace(/&(?:nbsp|amp|quot|#39);/g, "")
    .replace(/[^0-9a-z가-힣]/g, "")
    .replace(/웨딩홀|예식홀/g, "")
    .trim();
}

function decodeHtml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ");
}

function stripHtml(value: string): string {
  return decodeHtml(
    value
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " "),
  ).trim();
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
  return match ? decodeHtml(match[1]) : null;
}

function extractImages(html: string, pageUrl: string): ImageCandidate[] {
  const candidates: ImageCandidate[] = [];
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const rawUrl =
      attr(tag, "data-original") ??
      attr(tag, "data-src") ??
      attr(tag, "src");
    if (!rawUrl || rawUrl.startsWith("data:")) continue;

    let url: string;
    try {
      url = new URL(rawUrl, pageUrl).href;
    } catch {
      continue;
    }
    if (!/^https:\/\//.test(url) || !/\.(?:avif|jpe?g|png|webp)(?:\?|$)/i.test(url)) {
      continue;
    }

    const start = Math.max(0, (match.index ?? 0) - 1_500);
    candidates.push({
      url,
      alt: attr(tag, "alt") ?? "",
      context: stripHtml(html.slice(start, (match.index ?? 0) + tag.length)),
    });
  }
  return candidates;
}

function hallAliases(hallName: string): string[] {
  const normalized = normalize(hallName);
  const withoutHall = normalized.endsWith("홀")
    ? normalized.slice(0, -1)
    : normalized;
  return [...new Set([normalized, withoutHall].filter((value) => value.length >= 2))];
}

function mentionsHall(value: string, hallName: string): boolean {
  const normalizedValue = normalize(value);
  return hallAliases(hallName).some((alias) => normalizedValue.includes(alias));
}

function scoreCandidate(candidate: ImageCandidate, hall: Hall, isMultiHall: boolean): number {
  const combined = `${candidate.alt} ${candidate.context}`;
  const exactAlt = mentionsHall(candidate.alt, hall.hallName);
  const exactContext = mentionsHall(candidate.context, hall.hallName);
  if (isMultiHall && !exactAlt && !exactContext) return Number.NEGATIVE_INFINITY;

  let score = exactAlt ? 140 : exactContext ? 80 : 0;
  if (mentionsHall(candidate.alt, hall.venueName)) score += 20;
  if (IMAGE_KEYWORDS.some((keyword) => combined.toLocaleLowerCase("ko").includes(keyword))) {
    score += 30;
  }
  if (EXCLUDED_IMAGE_KEYWORDS.some((keyword) => combined.toLocaleLowerCase("ko").includes(keyword))) {
    score -= 120;
  }
  if (/thumbnail|thumb|logo|icon/i.test(candidate.url)) score -= 25;
  return score;
}

function isPublicHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return PUBLIC_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return true;
  }
}

function candidateSourceUrls(hall: Hall, existingPhoto: HallPhoto | undefined): string[] {
  return [...new Set([hall.website, hall.sourceUrl, existingPhoto?.sourceUrl])]
    .filter((url): url is string => Boolean(url && /^https:\/\//.test(url)))
    .sort((a, b) => Number(isPublicHost(a)) - Number(isPublicHost(b)));
}

async function fetchPage(url: string): Promise<{ html: string; url: string } | null> {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; ViewddingPhotoAudit/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return null;
    return { html: await response.text(), url: response.url };
  } catch {
    return null;
  }
}

const pageCache = new Map<string, Promise<{ html: string; url: string } | null>>();
function cachedPage(url: string) {
  const cached = pageCache.get(url);
  if (cached) return cached;
  const request = fetchPage(url);
  pageCache.set(url, request);
  return request;
}

async function auditHall(hall: Hall): Promise<{
  replacement: ReplacementSeed | null;
  verification: VerificationEntry | null;
  audit: AuditResult;
}> {
  const existingPhoto = hallPhotosByHallId[hall.id]?.[0];
  const isMultiHall = (venueCounts.get(hall.venueId) ?? 0) > 1;

  for (const sourceUrl of candidateSourceUrls(hall, existingPhoto)) {
    const page = await cachedPage(sourceUrl);
    if (!page) continue;
    const candidates = extractImages(page.html, page.url)
      .map((candidate) => ({
        candidate,
        score: scoreCandidate(candidate, hall, isMultiHall),
      }))
      .filter(({ score }) => Number.isFinite(score) && score >= (isMultiHall ? 60 : 20))
      .sort((a, b) => b.score - a.score);

    const chosen = candidates[0]?.candidate;
    if (chosen) {
      const publicSource = isPublicHost(page.url);
      const method: HallPhotoVerificationMethod = publicSource
        ? "public_named_listing"
        : isMultiHall
          ? "official_named_gallery"
          : "official_single_hall_venue";
      const note = isMultiHall
        ? "페이지의 이미지 설명 또는 인접 섹션에서 공식 홀명을 확인함."
        : "단일 홀 업체 페이지에서 예식 공간 이미지와 홀 정체성을 확인함.";
      return {
        replacement: {
          hallId: hall.id,
          url: chosen.url,
          sourceUrl: page.url,
          sourceType: publicSource ? "public_listing" : "official_website",
          usageStatus: publicSource
            ? "public_source_linked"
            : "official_source_linked",
          photoKind: "wedding_setup",
          checkedAt: CHECKED_AT,
        },
        verification: {
          identityStatus: "hall_confirmed",
          verificationMethod: method,
          verificationNote: note,
        },
        audit: {
          hallId: hall.id,
          venueId: hall.venueId,
          venueName: hall.venueName,
          hallName: hall.hallName,
          result: "confirmed",
          sourceUrl: page.url,
          photoUrl: chosen.url,
          reason: note,
        },
      };
    }
  }

  return {
    replacement: null,
    verification: null,
    audit: {
      hallId: hall.id,
      venueId: hall.venueId,
      venueName: hall.venueName,
      hallName: hall.hallName,
      result: "needs_review",
      sourceUrl: null,
      photoUrl: existingPhoto?.url ?? null,
      reason: existingPhoto
        ? "공개 페이지에서 사진과 개별 홀명을 연결하는 근거를 자동 확인하지 못함."
        : "확인 가능한 홀 사진을 자동 발견하지 못함.",
    },
  };
}

const results: Awaited<ReturnType<typeof auditHall>>[] = [];
const queue = [...hallsJson];
const workers = Array.from({ length: 8 }, async () => {
  while (queue.length > 0) {
    const hall = queue.shift();
    if (!hall) return;
    results.push(await auditHall(hall));
  }
});
await Promise.all(workers);

const replacements = results
  .map((result) => result.replacement)
  .filter((value): value is ReplacementSeed => value !== null)
  .sort((a, b) => a.hallId.localeCompare(b.hallId));
const verifications = Object.fromEntries(
  results
    .filter((result) => result.verification !== null)
    .sort((a, b) => a.audit.hallId.localeCompare(b.audit.hallId))
    .map((result) => [result.audit.hallId, result.verification]),
);
const audit = results
  .map((result) => result.audit)
  .sort((a, b) => a.hallId.localeCompare(b.hallId));

await writeFile(
  path.join(ROOT, "src/data/hall-photo-replacements.generated.json"),
  `${JSON.stringify(replacements, null, 2)}\n`,
  "utf8",
);
await writeFile(
  path.join(ROOT, "src/data/hall-photo-verification.generated.json"),
  `${JSON.stringify(verifications, null, 2)}\n`,
  "utf8",
);
await writeFile(
  path.join(ROOT, "src/data/hall-photo-audit.generated.json"),
  `${JSON.stringify(audit, null, 2)}\n`,
  "utf8",
);

const confirmed = audit.filter((entry) => entry.result === "confirmed").length;
console.log(
  JSON.stringify(
    {
      checkedAt: CHECKED_AT,
      halls: hallsJson.length,
      confirmed,
      needsReview: audit.length - confirmed,
      sourcePagesFetched: pageCache.size,
    },
    null,
    2,
  ),
);
