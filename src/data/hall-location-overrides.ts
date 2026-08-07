export type HallLocationSourceType =
  | "official_public"
  | "official_venue"
  | "official_map"
  | "verified_directory";

export interface HallLocationOverride {
  address: string;
  sourceUrl: string;
  sourceType: HallLocationSourceType;
  district?: string;
  searchQuery?: string;
}

export const HALL_LOCATION_OVERRIDES: Record<string, HallLocationOverride> = {
  "V-SEO-20260729-004": {
    address: "서울특별시 강동구 선사로 83-106",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/549",
    sourceType: "official_public",
  },
  "V-SEO-20260729-016": {
    address: "서울특별시 강서구 마곡중앙5로 9",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/758",
    sourceType: "official_public",
  },
  "V-SEO-20260729-018": {
    address: "서울특별시 강서구 마곡동로 161",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3201",
    sourceType: "official_public",
  },
  "V-SEO-20260729-031": {
    address: "서울특별시 광진구 아차산로 400",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3218",
    sourceType: "official_public",
  },
  "V-SEO-20260729-032": {
    address: "서울특별시 광진구 강변북로 2216",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3196",
    sourceType: "official_public",
  },
  "V-SEO-20260729-038": {
    address: "서울특별시 구로구 구로중앙로 134 리치몰 1·3층",
    sourceUrl: "https://thewedd.com/hall-81/",
    sourceType: "verified_directory",
  },
  "V-SEO-20260729-042": {
    address: "서울특별시 구로구 새말로 97",
    sourceUrl: "https://place.map.kakao.com/326511102",
    sourceType: "official_map",
    searchQuery: "웨딩시티 신도림",
  },
  "V-SEO-20260729-043": {
    address: "서울특별시 구로구 서해안로 2117",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3202",
    sourceType: "official_public",
  },
  "V-SEO-20260729-044": {
    address: "서울특별시 금천구 시흥대로 201 홈플러스 시흥점 7층",
    sourceUrl: "https://thewedd.com/hall-79/",
    sourceType: "verified_directory",
  },
  "V-SEO-20260729-045": {
    address: "서울특별시 금천구 시흥동 411-26",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3204",
    sourceType: "official_public",
  },
  "V-SEO-20260729-048": {
    address: "서울특별시 노원구 화랑로 325",
    sourceUrl: "https://jwconvention.co.kr/m/m_sub05_01.html",
    sourceType: "official_venue",
    searchQuery: "제이더블유컨벤션웨딩홀",
  },
  "V-SEO-20260729-050": {
    address: "서울특별시 노원구 동일로 1238",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/407",
    sourceType: "official_public",
  },
  "V-SEO-20260729-051": {
    address: "서울특별시 노원구 중계동 산 42-3",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/761",
    sourceType: "official_public",
  },
  "V-SEO-20260729-052": {
    address: "서울특별시 도봉구 도봉로169길 202",
    sourceUrl: "https://www.tripinfo.co.kr/info.html?content_id=2379200&content_type_id=39&navi=trip_hot-seoul",
    sourceType: "verified_directory",
  },
  "V-SEO-20260729-053": {
    address: "서울특별시 도봉구 마들로 656 도봉구청사 2층",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3220",
    sourceType: "official_public",
  },
  "V-SEO-20260729-061": {
    address: "서울특별시 동대문구 약령중앙로 26",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/436",
    sourceType: "official_public",
  },
  "V-SEO-20260729-063": {
    address: "서울특별시 동작구 상도로 120",
    sourceUrl: "https://www.marieenco.co.kr/place/32",
    sourceType: "official_venue",
    searchQuery: "핸드픽트호텔",
  },
  "V-SEO-20260729-065": {
    address: "서울특별시 동작구 여의대방로20나길 16",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/474",
    sourceType: "official_public",
  },
  "V-SEO-20260729-070": {
    address: "서울특별시 서대문구 연희로32길 134",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3203",
    sourceType: "official_public",
  },
  "V-SEO-20260729-087": {
    address: "서울특별시 서초구 서초중앙로 96",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3224",
    sourceType: "official_public",
  },
  "V-SEO-20260729-088": {
    address: "서울특별시 서초구 서초중앙로 96",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3225",
    sourceType: "official_public",
  },
  "V-SEO-20260729-101": {
    address: "서울특별시 성북구 동소문로 284 길음서희스타힐스 1·2층",
    sourceUrl: "https://www.weddingcrowd.kr/hall/view.php?idx=1385",
    sourceType: "verified_directory",
  },
  "V-SEO-20260729-106": {
    address: "서울특별시 송파구 올림픽로 319 3층",
    sourceUrl: "https://jamsil.theconvention.co.kr/",
    sourceType: "official_venue",
  },
  "V-SEO-20260729-108": {
    address: "서울특별시 송파구 천호대로 996",
    sourceUrl: "https://pf.kakao.com/_dRpfG/109066663",
    sourceType: "official_venue",
    district: "송파구",
  },
  "V-SEO-20260729-118": {
    address: "서울특별시 송파구 백제고분로 2",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3197",
    sourceType: "official_public",
  },
  "V-SEO-20260729-119": {
    address: "서울특별시 송파구 위례성대로 71",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3198",
    sourceType: "official_public",
  },
  "V-SEO-20260729-125": {
    address: "서울특별시 영등포구 여의나루로 76 한국거래소",
    sourceUrl: "https://thewedd.com/hall-63/",
    sourceType: "verified_directory",
  },
  "V-SEO-20260729-126": {
    address: "서울특별시 영등포구 여의대로 14 KT빌딩",
    sourceUrl: "https://www.ywedding.co.kr/about/",
    sourceType: "official_venue",
  },
  "V-SEO-20260729-135": {
    address: "서울특별시 영등포구 선유로 343",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/395",
    sourceType: "official_public",
  },
  "V-SEO-20260729-136": {
    address: "서울특별시 영등포구 여의동로 338",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3194",
    sourceType: "official_public",
  },
  "V-SEO-20260729-138": {
    address: "서울특별시 영등포구 양산로 232",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3215",
    sourceType: "official_public",
  },
  "V-SEO-20260729-148": {
    address: "서울특별시 용산구 서빙고로 185",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/4187",
    sourceType: "official_public",
  },
  "V-SEO-20260729-149": {
    address: "서울특별시 용산구 녹사평대로 150",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/3219",
    sourceType: "official_public",
  },
  "V-SEO-20260729-150": {
    address: "서울특별시 은평구 연서로48길 72",
    sourceUrl: "https://yozmwedding.co.kr/venue/?bmode=view&idx=171359921",
    sourceType: "verified_directory",
  },
  "V-SEO-20260729-153": {
    address: "서울특별시 은평구 연서로50길 8",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/1519",
    sourceType: "official_public",
  },
  "V-SEO-20260729-155": {
    address: "서울특별시 종로구 인사동6길 14",
    sourceUrl: "https://www.directwedding.co.kr/weddinghall/hall0175",
    sourceType: "verified_directory",
  },
  "V-SEO-20260729-167": {
    address: "서울특별시 종로구 세종대로 175",
    sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/753",
    sourceType: "official_public",
  },
};
