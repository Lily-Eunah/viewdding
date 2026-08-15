import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "./data/national-followup-saturation-data.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(projectRoot, "src", "data", "national-followup-halls.source.generated.json");
const compactDate = config.date.replaceAll("-", "");

const venueRows = config.venues.map((venue, index) => {
  const venueId = venue.id ?? `V-${config.regionCode}-${compactDate}-${String(index + 1).padStart(3, "0")}`;
  return {
    venue_id: venueId,
    "공식 업체명": venue.name,
    "브랜드명": venue.brand ?? null,
    "지점명": venue.branch ?? null,
    "이전 상호": venue.alias ?? null,
    "공간 형태": venue.type,
    "운영 상태": venue.status,
    "오픈·폐업일": null,
    "도로명주소": venue.address,
    "자치구": venue.district,
    "행정동": venue.neighborhood ?? null,
    "위도": null,
    "경도": null,
    "대표 전화": venue.phone ?? null,
    "공식 홈페이지": venue.url ?? null,
    "공식 인스타그램": venue.instagram ?? null,
    "지도 장소 ID": null,
    "지도 URL": null,
    "최근 운영 확인일": config.date,
    "대표 source_id": `S-${compactDate}-${config.regionCode}-${String(index + 1).padStart(3, "0")}`,
    "내부 메모": venue.evidence,
    "운영 검수": venue.review,
  };
});

const venueByName = new Map(config.venues.map((venue, index) => [venue.name, { venue, row: venueRows[index] }]));
const hallRows = config.halls.map((hall, index) => {
  const matched = venueByName.get(hall.venue);
  if (!matched) throw new Error(`Unknown venue: ${hall.venue}`);
  const hallId = hall.id ?? `H-${config.regionCode}-${compactDate}-${String(index + 1).padStart(3, "0")}`;
  const publishable = hall.publish && matched.venue.status === "운영확인";
  return {
    hall_id: hallId,
    venue_id: matched.row.venue_id,
    "공식 홀명": hall.name,
    "대표 분류": hall.category,
    "공간 조도": hall.light ?? "미확인",
    "자연광": hall.daylight ?? "미확인",
    "채플 스타일": hall.chapel ?? "N",
    "하우스 스타일": hall.house ?? "N",
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
    "천고": hall.ceiling ?? null,
    "특징 태그": hall.tags ?? null,
    "분류 근거": hall.reason,
    "분류 신뢰도": hall.confidence,
    "분류 확인일": config.date,
    "대표 source_id": matched.row["대표 source_id"],
    "공개 상태": publishable ? "공개" : "보류",
    "공개 준비상태": publishable ? "공개가능" : "보완필요",
    "내부 의견": publishable ? "운영·홀명·대표 분류 확인" : "업체 문의 후 재검토",
    detail_id: `D-${config.regionCode}-${compactDate}-${String(index + 1).padStart(3, "0")}`,
    "상세 조사상태": publishable ? "상세확인" : "부분확인",
    "상세 source_id": matched.row["대표 source_id"],
    "상세 출처등급": matched.venue.sourceGrade,
    "상세 출처종류": matched.venue.sourceType,
    "상세 URL": hall.url ?? matched.venue.url ?? null,
    "상세 확인일": config.date,
    "상세 비고": hall.reason,
  };
});

await fs.writeFile(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  sourceFiles: [`Viewdding_광주_울산_천안아산_청주_제주_전주_웨딩홀_Master_포화조사_운영본_${compactDate}.xlsx`],
  venues: venueRows,
  halls: hallRows,
}, null, 2)}\n`, "utf8");

console.log(`Generated ${hallRows.filter((row) => row["공개 상태"] === "공개").length} public halls from ${venueRows.length} verified venues.`);
