import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : null;
const outputPath = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(projectRoot, "src/data/map-candidate-audit.generated.json");

if (!inputPath) {
  console.error("Usage: node scripts/build-map-candidate-audit.mjs <analysis-json> [output-json]");
  process.exit(1);
}

const analysis = JSON.parse(await fs.readFile(inputPath, "utf8"));
const currentTargetSidos = [
  "경기도",
  "인천광역시",
  "부산광역시",
  "경상남도",
  "대전광역시",
  "세종특별자치시",
  "대구광역시",
];

const candidateId = (candidate) => {
  const identity = [candidate.sido, candidate.name, candidate.address, candidate.placeId].join("|");
  return `MAP-${crypto.createHash("sha256").update(identity).digest("hex").slice(0, 12).toUpperCase()}`;
};

const reviewStatus = (decision) => {
  if (decision === "신규 후보") return "운영·홀 구조 확인 필요";
  if (decision === "기존 업체") return "기존 마스터 중복 확인";
  if (decision === "업종 제외") return "제외";
  return "타지역 노출";
};

const isLegacyIncheonLog = (log) => log.sido === "인천광역시" && /^구주소:/.test(log.unit);
const currentScopeLogs = analysis.queryLogs.filter((log) => {
  if (!currentTargetSidos.includes(log.sido)) return false;
  return !isLegacyIncheonLog(log);
});
const currentScopeUnits = new Set(currentScopeLogs.map((log) => `${log.sido}|${log.unit}`));
const legacyIncheonLogs = analysis.queryLogs.filter(isLegacyIncheonLog);

const audit = {
  generatedAt: analysis.generatedAt,
  auditDate: "2026-08-09",
  scope: currentTargetSidos,
  methodology: {
    purpose: "지도 검색에서 발견한 후보를 운영 마스터의 비공개 검토 큐로 적재",
    channels: ["카카오맵", "네이버지도"],
    queryPattern: "{시도} {시군구} 웨딩홀",
    collectionDepth: "채널별 검색 결과 첫 화면의 노출 항목",
    saturationStatus: "포화 조사 아님",
    publicationRule: "운영 여부와 개별 홀 구조를 확인하기 전에는 공개 데이터로 승격하지 않음",
  },
  coverage: {
    currentAdminUnitCount: currentScopeUnits.size,
    legacyIncheonUnitCount: new Set(legacyIncheonLogs.map((log) => log.unit)).size,
    searchLogCount: analysis.queryLogs.length,
    currentAdminSearchLogCount: currentScopeLogs.length,
    legacyIncheonSearchLogCount: legacyIncheonLogs.length,
  },
  stats: analysis.stats,
  queries: analysis.queryLogs,
  candidates: analysis.candidates.map((candidate) => ({
    candidate_id: candidateId(candidate),
    sido: candidate.sido,
    sigungu: candidate.district,
    name: candidate.name,
    category: candidate.category,
    address: candidate.address,
    lotAddress: candidate.lotAddress,
    phone: candidate.phone,
    operatingHint: candidate.status,
    hoursHint: candidate.hours,
    homepageHint: candidate.homepage,
    mapPlaceId: candidate.placeId,
    mapUrl: candidate.mapUrl,
    channels: candidate.channels,
    matchedQueries: candidate.matchedQueries,
    queryUnits: candidate.queryUnits,
    decision: candidate.decision,
    reviewStatus: reviewStatus(candidate.decision),
    reason: candidate.reason,
    matchedVenueId: candidate.matchedVenueId,
    matchedVenueName: candidate.matchedVenueName,
    matchedSourceFile: candidate.matchedSourceFile,
    publicEligible: false,
  })),
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
console.log(`Wrote ${audit.candidates.length} map audit rows to ${outputPath}`);
