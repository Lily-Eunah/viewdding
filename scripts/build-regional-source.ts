import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

type VenueConfig = Record<string, unknown> & {
  name: string;
  status: string;
  review: string;
  address: string;
  district: string;
  type: string;
};

type HallConfig = Record<string, unknown> & {
  venue: string;
  name: string;
  category: string;
  reason: string;
  confidence: string;
  publish?: boolean;
};

type RegionalConfig = {
  regionCode: string;
  date: string;
  officialInfoNames?: string[];
  venues: VenueConfig[];
  halls: HallConfig[];
};

const [dataPath, sourceFile, outputPath] = process.argv.slice(2);
if (!dataPath || !sourceFile || !outputPath) {
  throw new Error("Usage: tsx scripts/build-regional-source.ts <data.mjs> <source.xlsx> <output.json>");
}

const { default: config } = await import(pathToFileURL(path.resolve(dataPath)).href) as { default: RegionalConfig };
const compactDate = config.date.replaceAll("-", "");
const officialInfoNames = new Set(config.officialInfoNames ?? []);
const venueRows = config.venues.map((venue, index) => {
  const venueId = `V-${config.regionCode}-${compactDate}-${String(index + 1).padStart(3, "0")}`;
  const sourceId = `S-${compactDate}-${config.regionCode}-${String(index + 1).padStart(3, "0")}`;
  return {
    venue_id: venueId,
    "공식 업체명": venue.name,
    브랜드명: venue.brand ?? null,
    지점명: venue.branch ?? null,
    "이전 상호": venue.alias ?? null,
    "공간 형태": venue.type,
    "운영 상태": venue.status,
    "오픈·폐업일": null,
    도로명주소: venue.address,
    자치구: venue.district,
    행정동: venue.neighborhood ?? null,
    위도: null,
    경도: null,
    "대표 전화": venue.phone ?? null,
    "공식 홈페이지": venue.url ?? null,
    "공식 인스타그램": venue.instagram ?? null,
    "지도 장소 ID": venue.mapId ?? null,
    "지도 URL": venue.mapUrl ?? null,
    "최근 운영 확인일": config.date,
    "대표 source_id": sourceId,
    "내부 메모": venue.evidence,
    "운영 검수": venue.review,
  };
});

const venueByName = new Map(config.venues.map((venue, index) => [venue.name, {
  config: venue,
  venueId: `V-${config.regionCode}-${compactDate}-${String(index + 1).padStart(3, "0")}`,
  sourceId: `S-${compactDate}-${config.regionCode}-${String(index + 1).padStart(3, "0")}`,
}]));

const hallRows = config.halls.map((hall, index) => {
  const venue = venueByName.get(hall.venue);
  if (!venue) throw new Error(`Unknown venue for hall: ${hall.venue}`);
  const hallId = `H-${config.regionCode}-${compactDate}-${String(index + 1).padStart(3, "0")}`;
  const publishable = hall.publish ?? (venue.config.status === "운영확인" && hall.category !== "검토필요");
  const official = officialInfoNames.has(hall.venue);
  return {
    hall_id: hallId,
    venue_id: venue.venueId,
    "공식 홀명": hall.name,
    "대표 분류": hall.category,
    "공간 조도": hall.light ?? "미확인",
    자연광: hall.daylight ?? "미확인",
    "채플 스타일": hall.chapel ?? "미확인",
    "하우스 스타일": hall.house ?? "미확인",
    "실내·야외": hall.io ?? "미확인",
    "단독 사용": hall.exclusive ?? "미확인",
    "예식 형태": hall.ceremony ?? "미확인",
    "홀 착석인원": hall.seats ?? null,
    "최대 수용인원": hall.capacity ?? null,
    "최소 보증인원": hall.guarantee ?? null,
    "예식 간격(분)": hall.interval ?? null,
    "예식 시간": hall.time ?? null,
    "식사 유형": hall.meal ?? null,
    "버진로드 특징": hall.aisle ?? null,
    천고: hall.ceiling ?? null,
    "특징 태그": hall.tags ?? null,
    "분류 근거": hall.reason,
    "분류 신뢰도": hall.confidence,
    "분류 확인일": config.date,
    "대표 source_id": venue.sourceId,
    "공개 상태": publishable ? "공개" : "보류",
    "공개 준비상태": publishable ? "공개가능" : "보완필요",
    "내부 의견": publishable ? "운영·홀명·대표 분류 확인" : "공식 사진 또는 독립 판매 구조 보강 필요",
    detail_id: `D-${config.regionCode}-${compactDate}-${String(index + 1).padStart(3, "0")}`,
    "상세 조사상태": publishable ? "상세확인" : "부분확인",
    "상세 source_id": venue.sourceId,
    "상세 출처등급": hall.confidence.startsWith("A") ? "A" : "B",
    "상세 출처종류": official ? "공식홈페이지" : "현행판매채널",
    "상세 URL": hall.url ?? venue.config.url ?? null,
    "상세 확인일": config.date,
    "상세 비고": hall.reason,
  };
});

const output = {
  generatedAt: new Date().toISOString(),
  sourceFiles: [path.basename(sourceFile)],
  venues: venueRows,
  halls: hallRows,
};

await fs.mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
await fs.writeFile(path.resolve(outputPath), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Generated ${venueRows.length} venues and ${hallRows.length} halls in ${path.resolve(outputPath)}`);
