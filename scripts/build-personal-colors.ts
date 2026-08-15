import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import type {
  PersonalColorRecord,
  PersonalColorServiceTag,
  PersonalColorStatus,
  VerificationGrade,
} from "../src/domain/personal-color-types";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectRoot);

const spreadsheetId = "1WsC279RFHsKxbEyj-VobC0fwgB8YJdJarAKFSSLkrJI";
const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY?.trim() ?? "";
const outputPath = path.join(projectRoot, "src", "data", "personal-colors.generated.json");
const geocodeCachePath = path.join(projectRoot, "src", "data", "personal-color-geocodes.generated.json");

interface GeocodeCacheEntry {
  latitude: number;
  longitude: number;
  provider: "kakao_address" | "kakao_keyword" | "fallback_district";
  updatedAt: string;
}

type GeocodeCache = Record<string, GeocodeCacheEntry>;

// District centroid fallback coordinates for Korean regions
const DISTRICT_CENTROIDS: Record<string, { latitude: number; longitude: number }> = {
  "서울 강남구": { latitude: 37.5172, longitude: 127.0473 },
  "서울 서초구": { latitude: 37.4837, longitude: 127.0324 },
  "서울 송파구": { latitude: 37.5145, longitude: 127.1058 },
  "서울 성동구": { latitude: 37.5635, longitude: 127.0365 },
  "서울 마포구": { latitude: 37.5663, longitude: 126.9016 },
  "서울 영등포구": { latitude: 37.5264, longitude: 126.8962 },
  "서울 강서구": { latitude: 37.5509, longitude: 126.8495 },
  "서울 중구": { latitude: 37.5641, longitude: 126.9979 },
  "서울 종로구": { latitude: 37.5730, longitude: 126.9794 },
  "서울 성북구": { latitude: 37.5894, longitude: 127.0167 },
  "서울 광진구": { latitude: 37.5385, longitude: 127.0824 },
  "서울 관악구": { latitude: 37.4784, longitude: 126.9516 },
  "서울 금천구": { latitude: 37.4568, longitude: 126.8954 },
  "서울 구로구": { latitude: 37.4954, longitude: 126.8874 },
  "서울 용산구": { latitude: 37.5326, longitude: 126.9900 },
  "서울 은평구": { latitude: 37.6027, longitude: 126.9291 },
  "서울 노원구": { latitude: 37.6542, longitude: 127.0568 },
  "서울 강북구": { latitude: 37.6396, longitude: 127.0257 },
  "서울 서대문구": { latitude: 37.5791, longitude: 126.9368 },
  "서울 양천구": { latitude: 37.5169, longitude: 126.8665 },
  "경기 화성시": { latitude: 37.1995, longitude: 126.8315 },
  "경기 수원시": { latitude: 37.2636, longitude: 127.0286 },
  "경기 수원시 영통구": { latitude: 37.2596, longitude: 127.0465 },
  "경기 용인시": { latitude: 37.2411, longitude: 127.1776 },
  "경기 용인시 수지구": { latitude: 37.3220, longitude: 127.0975 },
  "경기 용인시 기흥구": { latitude: 37.2804, longitude: 127.1154 },
  "경기 부천시": { latitude: 37.5034, longitude: 126.7660 },
  "경기 성남시": { latitude: 37.4201, longitude: 127.1265 },
  "경기 성남시 분당구": { latitude: 37.3827, longitude: 127.1189 },
  "경기 고양시": { latitude: 37.6584, longitude: 126.8320 },
  "경기 남양주시": { latitude: 37.6360, longitude: 127.2165 },
  "경기 평택시": { latitude: 36.9921, longitude: 127.1129 },
  "경기 의정부시": { latitude: 37.7381, longitude: 127.0337 },
  "경기 안산시": { latitude: 37.3219, longitude: 126.8309 },
  "경기 군포시": { latitude: 37.3616, longitude: 126.9352 },
  "경기 하남시": { latitude: 37.5393, longitude: 127.2148 },
  "경기 김포시": { latitude: 37.6152, longitude: 126.7157 },
  "인천 부평구": { latitude: 37.5074, longitude: 126.7219 },
  "인천 연수구": { latitude: 37.4101, longitude: 126.6783 },
  "인천 미추홀구": { latitude: 37.4636, longitude: 126.6500 },
  "인천 남동구": { latitude: 37.4470, longitude: 126.7314 },
  "부산 부산진구": { latitude: 35.1631, longitude: 129.0531 },
  "부산 수영구": { latitude: 35.1456, longitude: 129.1131 },
  "부산 해운대구": { latitude: 35.1631, longitude: 129.1636 },
  "대구 중구": { latitude: 35.8693, longitude: 128.6062 },
  "대구 달서구": { latitude: 35.8298, longitude: 128.5327 },
  "대구 수성구": { latitude: 35.8580, longitude: 128.6306 },
  "대전 서구": { latitude: 36.3553, longitude: 127.3837 },
  "대전 유성구": { latitude: 36.3622, longitude: 127.3563 },
  "대전 중구": { latitude: 36.3259, longitude: 127.4214 },
  "광주 동구": { latitude: 35.1460, longitude: 126.9233 },
  "울산 남구": { latitude: 35.5439, longitude: 129.3301 },
  "울산 중구": { latitude: 35.5696, longitude: 129.3328 },
  "세종 나성동": { latitude: 36.4880, longitude: 127.2590 },
  "세종": { latitude: 36.4800, longitude: 127.2890 },
  "충북 청주시": { latitude: 36.6424, longitude: 127.4890 },
  "충남 천안시": { latitude: 36.8151, longitude: 127.1139 },
  "충남 아산시": { latitude: 36.7898, longitude: 127.0019 },
  "전북 전주시": { latitude: 35.8242, longitude: 127.1480 },
  "전남 목포시": { latitude: 34.8118, longitude: 126.3922 },
  "전남 무안군": { latitude: 34.9904, longitude: 126.4817 },
  "경북 경주시": { latitude: 35.8562, longitude: 129.2247 },
  "경북 구미시": { latitude: 36.1195, longitude: 128.3446 },
  "경북 포항시": { latitude: 36.0190, longitude: 129.3435 },
  "경남 창원시": { latitude: 35.2280, longitude: 128.6811 },
  "강원 강릉시": { latitude: 37.7519, longitude: 128.8761 },
  "강원 춘천시": { latitude: 37.8813, longitude: 127.7298 },
  "제주 제주시": { latitude: 33.4996, longitude: 126.5312 },
};

function parseCsv(contents: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];
    const next = contents[index + 1];
    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }
  return rows;
}

function objectsFromCsv<T extends Record<string, string>>(contents: string): T[] {
  const [headers, ...rows] = parseCsv(contents);
  if (!headers) return [];
  return rows.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header.trim(), (values[index] ?? "").trim()]))
  ) as T[];
}

function extractServiceTags(servicesStr: string, evidenceStr: string, nameStr: string): PersonalColorServiceTag[] {
  const combined = `${servicesStr} ${evidenceStr} ${nameStr}`;
  const tags: Set<PersonalColorServiceTag> = new Set();

  if (/골격|체형|바디|실루엣|페이스핏|체형분석|체형골격/i.test(combined)) {
    tags.add("body_shape");
  }
  if (/드레스|넥라인|소재|원단|화이트|베일|피팅/i.test(combined)) {
    tags.add("dress");
  }
  if (/헤어|메이크업|염색|뷰티|얼굴형|얼굴타입|얼굴분석|두상/i.test(combined)) {
    tags.add("makeup_hair");
  }
  if (/커플|신랑|예복|부부|남성/i.test(combined)) {
    tags.add("couple");
  }
  if (/토탈|웨딩컨설팅|웨딩코스|웨딩패키지|부케|액세서리|티아라|웨딩진단|웨딩이미지/i.test(combined)) {
    tags.add("total_wedding");
  }
  // All vendors are personal color vendors
  tags.add("color");

  return Array.from(tags);
}

function extractPriceNumbers(priceStr: string): { min: number | null; max: number | null } {
  if (!priceStr || priceStr.includes("문의") || priceStr === "WEDDING 변동가격(업주문의)") {
    return { min: null, max: null };
  }

  const numbers: number[] = [];

  // Match pattern like 168,000 or 250,000
  const commaMatches = priceStr.matchAll(/([0-9]{2,3}(?:,[0-9]{3})+)\s*원?/g);
  for (const match of commaMatches) {
    const num = parseInt(match[1].replace(/,/g, ""), 10);
    if (!isNaN(num) && num >= 10000) numbers.push(num);
  }

  // Match pattern like 25만원, 10만원, 89,000원
  const manMatches = priceStr.matchAll(/([0-9]+(?:\.[0-9]+)?)\s*만\s*원?/g);
  for (const match of manMatches) {
    const num = Math.round(parseFloat(match[1]) * 10000);
    if (!isNaN(num) && num >= 10000) numbers.push(num);
  }

  if (numbers.length === 0) {
    return { min: null, max: null };
  }

  numbers.sort((a, b) => a - b);
  return { min: numbers[0], max: numbers[numbers.length - 1] };
}

function mapStatus(raw: string): { status: PersonalColorStatus; active: boolean } {
  const clean = raw.trim();
  if (clean === "게재 권장") {
    return { status: "recommended", active: true };
  }
  if (clean === "예약 확인 후") {
    return { status: "verify_booking", active: true };
  }
  return { status: "on_hold", active: false };
}

function mapGrade(raw: string): VerificationGrade {
  const clean = raw.trim().toUpperCase();
  if (clean === "A") return "A";
  if (clean === "B") return "B";
  return "C";
}

async function geocodeAddress(
  address: string,
  name: string,
  district: string,
  sido: string,
  sigungu: string,
  cache: GeocodeCache
): Promise<{ latitude: number | null; longitude: number | null; provider: string }> {
  const cacheKey = `${district}:${name}:${address}`;
  if (cache[cacheKey]) {
    return {
      latitude: cache[cacheKey].latitude,
      longitude: cache[cacheKey].longitude,
      provider: cache[cacheKey].provider,
    };
  }

  // 1. Try Kakao Address Search REST API if key exists
  if (kakaoRestApiKey && address && address.length > 5 && !address.includes("확인 필요")) {
    try {
      const cleanAddress = address.replace(/\([^)]*\)/g, "").trim();
      const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(cleanAddress)}`;
      const res = await fetch(url, { headers: { Authorization: `KakaoAK ${kakaoRestApiKey}` } });
      if (res.ok) {
        const data = await res.json();
        if (data.documents && data.documents.length > 0) {
          const doc = data.documents[0];
          const lat = parseFloat(doc.y);
          const lng = parseFloat(doc.x);
          cache[cacheKey] = { latitude: lat, longitude: lng, provider: "kakao_address", updatedAt: new Date().toISOString() };
          return { latitude: lat, longitude: lng, provider: "kakao_address" };
        }
      }
    } catch {
      // ignore and fallback
    }

    // 2. Try Kakao Keyword Search (Name + Sigungu)
    try {
      const query = `${sido} ${sigungu} ${name}`.trim();
      const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { Authorization: `KakaoAK ${kakaoRestApiKey}` } });
      if (res.ok) {
        const data = await res.json();
        if (data.documents && data.documents.length > 0) {
          const doc = data.documents[0];
          const lat = parseFloat(doc.y);
          const lng = parseFloat(doc.x);
          cache[cacheKey] = { latitude: lat, longitude: lng, provider: "kakao_keyword", updatedAt: new Date().toISOString() };
          return { latitude: lat, longitude: lng, provider: "kakao_keyword" };
        }
      }
    } catch {
      // ignore and fallback
    }
  }

  // 3. Fallback to District Centroid
  const centroidKeys = [
    `${sido} ${sigungu}`,
    sigungu,
    sido,
    district,
  ];

  for (const k of centroidKeys) {
    if (DISTRICT_CENTROIDS[k]) {
      const { latitude, longitude } = DISTRICT_CENTROIDS[k];
      cache[cacheKey] = { latitude, longitude, provider: "fallback_district", updatedAt: new Date().toISOString() };
      return { latitude, longitude, provider: "fallback_district" };
    }
  }

  return { latitude: 37.5665, longitude: 126.9780, provider: "seoul_center" };
}

async function main() {
  console.log("Fetching Wedding Personal Color spreadsheet data...");
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=0`;

  let csvText = "";
  try {
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    csvText = await res.text();
  } catch (err) {
    console.warn("Failed to fetch directly from Google Sheet, checking local cached content...", err);
    const backupPath = path.join(projectRoot, "scripts", "data", "personal-color-source.csv");
    csvText = await fs.readFile(backupPath, "utf8");
  }

  const rows = objectsFromCsv<Record<string, string>>(csvText);
  console.log(`Parsed ${rows.length} rows from CSV.`);

  let geocodeCache: GeocodeCache = {};
  try {
    geocodeCache = JSON.parse(await fs.readFile(geocodeCachePath, "utf8"));
  } catch {
    geocodeCache = {};
  }

  const records: PersonalColorRecord[] = [];

  for (const row of rows) {
    const id = row["업체ID"] || `WD-${records.length + 1}`;
    const name = row["업체명"] || "";
    if (!name) continue;

    const rawStatus = row["게재상태"] || "게재 권장";
    const { status, active } = mapStatus(rawStatus);
    const sido = row["시도"] || "";
    const sigungu = row["시군구"] || "";
    const district = `${sido} ${sigungu}`.trim();
    const address = row["주소/권역"] || "";
    const evidence = row["웨딩서비스 근거"] || "";
    const servicesRaw = row["확인 서비스"] || "";
    const services = servicesRaw
      .replace(/[/,]/g, "·")
      .split("·")
      .map((s) => s.trim())
      .filter(Boolean);

    const serviceTags = extractServiceTags(servicesRaw, evidence, name);
    const priceRaw = row["가격 참고"] || "문의";
    const { min: priceEstimatedMin, max: priceEstimatedMax } = extractPriceNumbers(priceRaw);

    const naverMapUrl = row["네이버지도"] || null;
    const reviewUrl = row["네이버블로그/카페"] || row["기타 출처"] || null;
    const instagramUrl = row["공식 인스타(확인)"] || null;
    const grade = mapGrade(row["근거등급"] || "B");
    const verifiedAt = row["확인일"] || null;
    const notes = row["운영 메모"] || null;

    const { latitude, longitude } = await geocodeAddress(
      address,
      name,
      district,
      sido,
      sigungu,
      geocodeCache
    );

    records.push({
      id,
      sourceId: id,
      status,
      statusRaw: rawStatus,
      name,
      sido,
      sigungu,
      district,
      address,
      evidence,
      services,
      serviceTags,
      priceRaw,
      priceEstimatedMin,
      priceEstimatedMax,
      naverMapUrl,
      reviewUrl,
      instagramUrl,
      grade,
      verifiedAt,
      notes,
      latitude,
      longitude,
      active,
    });
  }

  // Save generated JSON
  await fs.writeFile(outputPath, JSON.stringify(records, null, 2), "utf8");
  await fs.writeFile(geocodeCachePath, JSON.stringify(geocodeCache, null, 2), "utf8");

  console.log(`Successfully generated ${records.length} wedding personal color records!`);
  console.log(`Active count (recommended + verify_booking): ${records.filter((r) => r.active).length}`);
  console.log(`On hold count: ${records.filter((r) => !r.active).length}`);
  console.log(`Saved to ${outputPath}`);
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
