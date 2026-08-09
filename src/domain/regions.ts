import type { HallRecord, Sido } from "./types";

export interface RegionFields {
  sido: Sido;
  sigungu: string;
  subdistrict: string | null;
  regionCode: string;
  metroArea: string;
}

interface RegionDefinition {
  sido: Sido;
  sigungu: string;
  regionCode: string;
  metroArea: string;
}

export const SIDO_OPTIONS: ReadonlyArray<{ value: Sido; label: string; shortLabel: string }> = [
  { value: "서울특별시", label: "서울특별시", shortLabel: "서울" },
  { value: "경기도", label: "경기도", shortLabel: "경기" },
  { value: "인천광역시", label: "인천광역시", shortLabel: "인천" },
  { value: "부산광역시", label: "부산광역시", shortLabel: "부산" },
  { value: "경상남도", label: "경상남도", shortLabel: "경남" },
  { value: "대전광역시", label: "대전광역시", shortLabel: "대전" },
  { value: "세종특별자치시", label: "세종특별자치시", shortLabel: "세종" },
  { value: "대구광역시", label: "대구광역시", shortLabel: "대구" },
  { value: "광주광역시", label: "광주광역시", shortLabel: "광주" },
  { value: "충청남도", label: "충청남도", shortLabel: "충남" },
  { value: "울산광역시", label: "울산광역시", shortLabel: "울산" },
  { value: "충청북도", label: "충청북도", shortLabel: "충북" },
  { value: "제주특별자치도", label: "제주특별자치도", shortLabel: "제주" },
  { value: "전북특별자치도", label: "전북특별자치도", shortLabel: "전북" },
];

const SEOUL_METRO_AREAS: Record<string, string> = {
  종로구: "서울 도심권", 중구: "서울 도심권", 용산구: "서울 도심권",
  성동구: "서울 동북권", 광진구: "서울 동북권", 동대문구: "서울 동북권", 중랑구: "서울 동북권",
  성북구: "서울 동북권", 강북구: "서울 동북권", 도봉구: "서울 동북권", 노원구: "서울 동북권",
  은평구: "서울 서북권", 서대문구: "서울 서북권", 마포구: "서울 서북권",
  양천구: "서울 서남권", 강서구: "서울 서남권", 구로구: "서울 서남권", 금천구: "서울 서남권",
  영등포구: "서울 서남권", 동작구: "서울 서남권", 관악구: "서울 서남권",
  서초구: "서울 동남권", 강남구: "서울 동남권", 송파구: "서울 동남권", 강동구: "서울 동남권",
};

const GYEONGGI_METRO_AREAS: Record<string, string> = {
  수원시: "수원", 용인시: "용인", 화성시: "화성·오산", 오산시: "화성·오산",
  고양시: "고양·일산·파주", 파주시: "고양·일산·파주",
  평택시: "평택·안성", 안성시: "평택·안성",
  성남시: "성남·하남·광주", 하남시: "성남·하남·광주", 광주시: "성남·하남·광주",
  안양시: "안양·과천·군포·의왕", 과천시: "안양·과천·군포·의왕", 군포시: "안양·과천·군포·의왕", 의왕시: "안양·과천·군포·의왕",
  부천시: "부천·광명", 광명시: "부천·광명",
  안산시: "안산·시흥", 시흥시: "안산·시흥",
  남양주시: "남양주·구리", 구리시: "남양주·구리",
  의정부시: "의정부·양주·동두천", 양주시: "의정부·양주·동두천", 동두천시: "의정부·양주·동두천",
  김포시: "김포", 이천시: "이천·여주·양평", 여주시: "이천·여주·양평", 양평군: "이천·여주·양평",
  포천시: "경기 북부", 가평군: "경기 북부", 연천군: "경기 북부",
};

const INCHEON_METRO_AREAS: Record<string, string> = {
  강화군: "강화", 옹진군: "인천 도서", 제물포구: "인천 원도심", 영종구: "영종",
  미추홀구: "인천 원도심", 연수구: "송도·연수", 남동구: "남동",
  부평구: "부평·계양", 계양구: "부평·계양", 서해구: "청라·서해", 검단구: "검단",
};

const BUSAN_METRO_AREAS: Record<string, string> = {
  중구: "부산 도심권", 서구: "부산 도심권", 동구: "부산 도심권", 영도구: "부산 도심권", 부산진구: "부산 도심권",
  동래구: "부산 동부권", 연제구: "부산 동부권", 금정구: "부산 동부권",
  남구: "해운대·수영", 수영구: "해운대·수영", 해운대구: "해운대·수영",
  북구: "부산 서부권", 사상구: "부산 서부권", 사하구: "부산 서부권", 강서구: "부산 서부권",
  기장군: "기장",
};

const GYEONGNAM_METRO_AREAS: Record<string, string> = {
  창원시: "창원", 김해시: "김해·양산", 양산시: "김해·양산",
  진주시: "진주·사천", 사천시: "진주·사천", 거제시: "거제·통영·고성", 통영시: "거제·통영·고성", 고성군: "거제·통영·고성",
  밀양시: "밀양·창녕", 창녕군: "밀양·창녕", 남해군: "남해·하동", 하동군: "남해·하동",
  거창군: "서북부 경남", 함양군: "서북부 경남", 합천군: "서북부 경남", 산청군: "서북부 경남",
  함안군: "함안·의령", 의령군: "함안·의령",
};

const DAEJEON_METRO_AREAS: Record<string, string> = {
  동구: "대전 도심권", 중구: "대전 도심권", 서구: "대전 도심권", 유성구: "대전 유성·대덕", 대덕구: "대전 유성·대덕",
};

const SEJONG_METRO_AREAS: Record<string, string> = { 세종시: "세종" };

const DAEGU_METRO_AREAS: Record<string, string> = {
  중구: "대구 도심권", 남구: "대구 도심권", 서구: "대구 도심권",
  동구: "대구 동부권", 수성구: "대구 동부권", 북구: "대구 북부권", 군위군: "대구 북부권",
  달서구: "대구 달서·달성", 달성군: "대구 달서·달성",
};

const GWANGJU_METRO_AREAS: Record<string, string> = {
  동구: "광주", 서구: "광주", 남구: "광주", 북구: "광주", 광산구: "광주",
};

const CHUNGNAM_METRO_AREAS: Record<string, string> = { 천안시: "천안·아산", 아산시: "천안·아산" };
const ULSAN_METRO_AREAS: Record<string, string> = { 중구: "울산", 남구: "울산", 동구: "울산", 북구: "울산", 울주군: "울산" };
const CHUNGBUK_METRO_AREAS: Record<string, string> = { 청주시: "청주" };
const JEJU_METRO_AREAS: Record<string, string> = { 제주시: "제주", 서귀포시: "제주" };
const JEONBUK_METRO_AREAS: Record<string, string> = { 전주시: "전주" };

function definitions(
  sido: Sido,
  sigungus: string[],
  codePrefix: string,
  metroAreas: Record<string, string>,
): RegionDefinition[] {
  // 아래 객체의 key 순서는 공개된 regionCode와 연결된 append-only 레지스트리입니다.
  // 표시명 변경은 같은 위치의 key만 바꾸고, 기존 항목을 재정렬하거나 사이에 삽입하지 않습니다.
  return sigungus.map((sigungu, index) => ({
    sido,
    sigungu,
    // Viewdding 내부 불변 ID입니다. 표시명이 바뀌어도 기존 ID는 재사용합니다.
    regionCode: `VDD-${codePrefix}-${String(index + 1).padStart(3, "0")}`,
    metroArea: metroAreas[sigungu],
  }));
}

export const REGION_DEFINITIONS: ReadonlyArray<RegionDefinition> = [
  ...definitions("서울특별시", Object.keys(SEOUL_METRO_AREAS), "11", SEOUL_METRO_AREAS),
  ...definitions("경기도", Object.keys(GYEONGGI_METRO_AREAS), "41", GYEONGGI_METRO_AREAS),
  ...definitions("인천광역시", Object.keys(INCHEON_METRO_AREAS), "28", INCHEON_METRO_AREAS),
  ...definitions("부산광역시", Object.keys(BUSAN_METRO_AREAS), "26", BUSAN_METRO_AREAS),
  ...definitions("경상남도", Object.keys(GYEONGNAM_METRO_AREAS), "48", GYEONGNAM_METRO_AREAS),
  ...definitions("대전광역시", Object.keys(DAEJEON_METRO_AREAS), "30", DAEJEON_METRO_AREAS),
  ...definitions("세종특별자치시", Object.keys(SEJONG_METRO_AREAS), "36", SEJONG_METRO_AREAS),
  ...definitions("대구광역시", Object.keys(DAEGU_METRO_AREAS), "27", DAEGU_METRO_AREAS),
  ...definitions("광주광역시", Object.keys(GWANGJU_METRO_AREAS), "29", GWANGJU_METRO_AREAS),
  ...definitions("충청남도", Object.keys(CHUNGNAM_METRO_AREAS), "44", CHUNGNAM_METRO_AREAS),
  ...definitions("울산광역시", Object.keys(ULSAN_METRO_AREAS), "31", ULSAN_METRO_AREAS),
  ...definitions("충청북도", Object.keys(CHUNGBUK_METRO_AREAS), "43", CHUNGBUK_METRO_AREAS),
  ...definitions("제주특별자치도", Object.keys(JEJU_METRO_AREAS), "50", JEJU_METRO_AREAS),
  ...definitions("전북특별자치도", Object.keys(JEONBUK_METRO_AREAS), "52", JEONBUK_METRO_AREAS),
];

const REGION_BY_KEY = new Map(
  REGION_DEFINITIONS.map((region) => [`${region.sido}|${region.sigungu}`, region]),
);

function normalizedAddress(value: string | null | undefined): string {
  return (value ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();
}

function sidoFromAddress(address: string): Sido | null {
  if (/^(?:서울|서울특별시)(?:\s|$)/.test(address)) return "서울특별시";
  if (/^(?:경기|경기도)(?:\s|$)/.test(address)) return "경기도";
  if (/^(?:인천|인천광역시)(?:\s|$)/.test(address)) return "인천광역시";
  if (/^(?:부산|부산광역시)(?:\s|$)/.test(address)) return "부산광역시";
  if (/^(?:경남|경상남도)(?:\s|$)/.test(address)) return "경상남도";
  if (/^(?:대전|대전광역시)(?:\s|$)/.test(address)) return "대전광역시";
  if (/^(?:세종|세종특별자치시)(?:\s|$)/.test(address)) return "세종특별자치시";
  if (/^(?:대구|대구광역시)(?:\s|$)/.test(address)) return "대구광역시";
  if (/^(?:광주|광주광역시|전남광주통합특별시)(?:\s|$)/.test(address)) return "광주광역시";
  if (/^(?:충남|충청남도)(?:\s|$)/.test(address)) return "충청남도";
  if (/^(?:울산|울산광역시)(?:\s|$)/.test(address)) return "울산광역시";
  if (/^(?:충북|충청북도)(?:\s|$)/.test(address)) return "충청북도";
  if (/^(?:제주|제주특별자치도)(?:\s|$)/.test(address)) return "제주특별자치도";
  if (/^(?:전북|전라북도|전북특별자치도)(?:\s|$)/.test(address)) return "전북특별자치도";
  return null;
}

function locationParts(sido: Sido, address: string, legacyDistrict: string): { sigungu: string; subdistrict: string | null } | null {
  const withoutSido = address.replace(/^(?:서울특별시|서울|경기도|경기|인천광역시|인천|부산광역시|부산|경상남도|경남|대전광역시|대전|세종특별자치시|세종|대구광역시|대구|광주광역시|광주|전남광주통합특별시|충청남도|충남|울산광역시|울산|충청북도|충북|제주특별자치도|제주|전북특별자치도|전라북도|전북)\s+/, "");
  if (sido === "서울특별시") {
    const sigungu = withoutSido.match(/^([가-힣]+구)(?:\s|$)/)?.[1]
      ?? legacyDistrict.match(/^([가-힣]+구)$/)?.[1];
    return sigungu ? { sigungu, subdistrict: null } : null;
  }
  if (sido === "경기도" || sido === "경상남도" || sido === "충청남도" || sido === "충청북도" || sido === "제주특별자치도" || sido === "전북특별자치도") {
    const match = withoutSido.match(/^([가-힣]+(?:시|군))(?:\s+([가-힣]+구))?/)
      ?? legacyDistrict.match(/^([가-힣]+(?:시|군))(?:\s+([가-힣]+구))?/);
    return match ? { sigungu: match[1], subdistrict: match[2] ?? null } : null;
  }
  if (sido === "세종특별자치시") return { sigungu: "세종시", subdistrict: null };
  const sigungu = withoutSido.match(/^([가-힣]+(?:구|군))(?:\s|$)/)?.[1]
    ?? legacyDistrict.match(/^([가-힣]+(?:구|군))$/)?.[1];
  return sigungu ? { sigungu, subdistrict: null } : null;
}

function inferSidoFromLegacyDistrict(legacyDistrict: string): Sido | null {
  const matches = SIDO_OPTIONS
    .map(({ value }) => value)
    .filter((sido) => REGION_BY_KEY.has(`${sido}|${legacyDistrict.split(" ")[0]}`));
  if (matches.length === 1) return matches[0];
  if (/^[가-힣]+(?:시|군)(?:\s+[가-힣]+구)?$/.test(legacyDistrict)) return "경기도";
  return null;
}

export function resolveRegion(address: string | null | undefined, legacyDistrict = ""): RegionFields | null {
  const normalized = normalizedAddress(address);
  // The original Seoul master contains district-only rows. Preserve that legacy contract
  // even after same-named districts from other cities are added to the registry.
  const legacySeoulSido = !normalized && SEOUL_METRO_AREAS[legacyDistrict] ? "서울특별시" : null;
  const sido = sidoFromAddress(normalized) ?? legacySeoulSido ?? inferSidoFromLegacyDistrict(legacyDistrict);
  if (!sido) return null;
  const parts = locationParts(sido, normalized, legacyDistrict);
  if (!parts) return null;
  const definition = REGION_BY_KEY.get(`${sido}|${parts.sigungu}`);
  if (!definition) return null;
  return {
    sido,
    sigungu: parts.sigungu,
    subdistrict: parts.subdistrict,
    regionCode: definition.regionCode,
    metroArea: definition.metroArea,
  };
}

export function regionDisplayName(region: Pick<RegionFields, "sigungu" | "subdistrict">): string {
  return [region.sigungu, region.subdistrict].filter(Boolean).join(" ");
}

export function shortSidoLabel(sido: Sido): string {
  return SIDO_OPTIONS.find((option) => option.value === sido)?.shortLabel ?? sido;
}

export function hallRegionLabel(hall: Pick<HallRecord, "sido" | "sigungu" | "subdistrict">): string {
  return `${shortSidoLabel(hall.sido)} · ${regionDisplayName(hall)}`;
}
