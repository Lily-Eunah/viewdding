import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import gyeonggiSourceJson from "../src/data/gyeonggi-halls.source.generated.json";
import incheonSourceJson from "../src/data/incheon-halls.source.generated.json";
import capitalExpansionSourceJson from "../src/data/capital-expansion-halls.source.generated.json";
import { applyHallNameAudit } from "../src/data/hall-name-audit";
import regionalExpansionSourceJson from "../src/data/regional-expansion-halls.source.generated.json";
import nationalFollowupSourceJson from "../src/data/national-followup-halls.source.generated.json";
import {
  cleanText,
  normalizeBoolean,
  normalizeCeremonyFormat,
  normalizeIndoorOutdoor,
  normalizeLighting,
  normalizeMeals,
  normalizeNaturalLight,
  normalizeVenueType,
  parseNumericRange,
  splitTags,
} from "../src/domain/normalization";
import { resolveRegion } from "../src/domain/regions";
import type { HallRecord } from "../src/domain/types";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const defaultMasterPath = path.join(projectRoot, "outputs", "viewdding_master_20260731_operational", "Viewdding_서울_웨딩홀_Master_운영본_20260731.xlsx");
const masterPath = process.env.VIEWDDING_MASTER_PATH ? path.resolve(process.env.VIEWDDING_MASTER_PATH) : defaultMasterPath;
const outputPath = path.join(projectRoot, "src", "data", "halls.generated.json");
const metadataPath = path.join(projectRoot, "src", "data", "metadata.generated.json");

type RowObject = Record<string, unknown>;
type InspectTable = { kind: string; sheet?: string; values?: unknown[][] };
type RegionalSource = {
  generatedAt: string;
  sourceFiles: string[];
  venues: RowObject[];
  halls: RowObject[];
};

function tableRowsFromInspect(contents: string, sheetName: string): RowObject[] {
  for (const line of contents.split(/\r?\n/)) {
    if (!line.includes(`"kind":"table","sheet":"${sheetName}"`)) continue;
    const table = JSON.parse(line) as InspectTable;
    if (!table.values || table.values.length < 5) continue;
    const headers = table.values[3].map((value) => String(value ?? "").trim());
    return table.values.slice(4).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? null])));
  }
  throw new Error(`${sheetName} 테이블을 검사 데이터에서 찾지 못했습니다.`);
}

const text = (value: unknown) => cleanText(value);
const date = (value: unknown) => text(value)?.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? text(value);

function normalizedDistrict(venue: RowObject): string {
  const address = text(venue["도로명주소"]);
  const gyeonggi = address?.match(/^(?:경기|경기도)\s+([가-힣]+(?:시|군))(?:\s+([가-힣]+구))?/);
  if (gyeonggi) return [gyeonggi[1], gyeonggi[2]].filter(Boolean).join(" ");
  const province = address?.match(/^(?:경남|경상남도|충남|충청남도|충북|충청북도|제주|제주특별자치도|전북|전라북도|전북특별자치도)\s+([가-힣]+(?:시|군))(?:\s+([가-힣]+구))?/);
  if (province) return [province[1], province[2]].filter(Boolean).join(" ");
  if (/^(?:세종|세종특별자치시)(?:\s|$)/.test(address ?? "")) return "세종시";
  const metroDistrict = address?.match(/^(?:서울|서울특별시|인천|인천광역시|부산|부산광역시|대전|대전광역시|대구|대구광역시|광주|광주광역시|울산|울산광역시)\s+([가-힣]+(?:구|군))/);
  if (metroDistrict) return metroDistrict[1];
  return text(venue["자치구"]) ?? "지역 확인 필요";
}

function toHall(row: RowObject, venue: RowObject): HallRecord {
  const ceremonyFormat = normalizeCeremonyFormat(row["예식 형태"], row["식사 유형"]);
  const district = normalizedDistrict(venue);
  const address = text(venue["도로명주소"]);
  const region = resolveRegion(address, district);
  if (!region) throw new Error(`지역을 정규화할 수 없습니다: ${String(row.hall_id)} (${address ?? district})`);
  return {
    id: String(row.hall_id), venueId: String(row.venue_id),
    venueName: text(venue["공식 업체명"]) ?? text(venue["브랜드명"]) ?? "업체명 확인 필요",
    hallName: text(row["공식 홀명"]) ?? "홀명 확인 필요",
    ...region, district, neighborhood: text(venue["행정동"]),
    address, phone: text(venue["대표 전화"]), website: text(venue["공식 홈페이지"]),
    instagram: text(venue["공식 인스타그램"]), mapUrl: text(venue["지도 URL"]), publicStatus: "public",
    lighting: normalizeLighting(row["공간 조도"]), naturalLight: normalizeNaturalLight(row["자연광"]),
    chapel: normalizeBoolean(row["채플 스타일"]), house: normalizeBoolean(row["하우스 스타일"]),
    indoorOutdoor: normalizeIndoorOutdoor(row["실내·야외"]), venueType: normalizeVenueType(venue["공간 형태"]),
    ceremonyFormat, meals: normalizeMeals(row["식사 유형"], ceremonyFormat),
    seated: parseNumericRange(row["홀 착석인원"]), capacity: parseNumericRange(row["최대 수용인원"]),
    guarantee: parseNumericRange(row["최소 보증인원"]), interval: parseNumericRange(row["예식 간격(분)"]),
    ceremonyTime: text(row["예식 시간"]), virginRoad: text(row["버진로드 특징"]), ceilingHeight: text(row["천고"]),
    featureTags: splitTags(row["특징 태그"]), classificationEvidence: text(row["분류 근거"]),
    confidence: text(row["분류 신뢰도"]), classificationCheckedAt: date(row["분류 확인일"]),
    detailCheckedAt: date(row["상세 확인일"]), sourceId: text(row["상세 source_id"]) ?? text(row["대표 source_id"]),
    sourceUrl: text(row["상세 URL"]), sourceType: text(row["상세 출처종류"]),
    raw: { representativeClassification: text(row["대표 분류"]), lighting: text(row["공간 조도"]),
      naturalLight: text(row["자연광"]), ceremonyFormat: text(row["예식 형태"]), mealType: text(row["식사 유형"]),
      venueType: text(venue["공간 형태"]) },
  };
}

const inspectPath = masterPath.endsWith(".ndjson") ? masterPath : `${masterPath}.inspect.ndjson`;
const inspectContents = await fs.readFile(inspectPath, "utf8");
const regionalSources = [gyeonggiSourceJson, incheonSourceJson, capitalExpansionSourceJson, regionalExpansionSourceJson, nationalFollowupSourceJson] as RegionalSource[];
const regionalSourceFiles = regionalSources.flatMap((source) => source.sourceFiles);
const venueRows = [
  ...tableRowsFromInspect(inspectContents, "01_업체"),
  ...regionalSources.flatMap((source) => source.venues),
];
const hallRows = [
  ...tableRowsFromInspect(inspectContents, "02_개별홀"),
  ...regionalSources.flatMap((source) => source.halls),
];
const venues = new Map(venueRows.map((row) => [String(row.venue_id), row]));
const publicRows = hallRows.filter((row) => row["공개 상태"] === "공개" && row["공개 준비상태"] === "공개가능");
const duplicateHallIds = publicRows
  .map((row) => String(row.hall_id))
  .filter((hallId, index, values) => values.indexOf(hallId) !== index);
if (duplicateHallIds.length > 0) throw new Error(`중복 hall_id: ${Array.from(new Set(duplicateHallIds)).join(", ")}`);
const missingVenues = new Set<string>();
const sourceHalls = publicRows.flatMap((row) => {
  const venue = venues.get(String(row.venue_id));
  if (!venue) { missingVenues.add(String(row.venue_id)); return []; }
  return [toHall(row, venue)];
});
const halls = applyHallNameAudit(sourceHalls);

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(halls, null, 2)}\n`, "utf8");
await fs.writeFile(metadataPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), sourceFile: path.basename(masterPath),
  sourceFiles: [path.basename(masterPath), ...regionalSourceFiles], sourceInspectFile: path.basename(inspectPath),
  regionalSourceGeneratedAt: Object.fromEntries(regionalSources.map((source) => [source.sourceFiles.join(", "), source.generatedAt])),
  sourceHallRows: hallRows.length, publicHallRows: publicRows.length,
  exportedHalls: halls.length, missingVenueIds: Array.from(missingVenues),
  regions: Array.from(new Set(halls.map((hall) => hall.sido))),
  districts: Array.from(new Set(halls.map((hall) => hall.district))).sort((a, b) => a.localeCompare(b, "ko")) }, null, 2)}\n`, "utf8");
console.log(`Generated ${halls.length} public halls from Seoul and ${regionalSourceFiles.length} regional masters`);
if (missingVenues.size > 0) console.warn(`Skipped missing venues: ${Array.from(missingVenues).join(", ")}`);
