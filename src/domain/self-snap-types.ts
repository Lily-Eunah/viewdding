export type SelfSnapItemCategory =
  | "all"
  | "dress"
  | "veil_acc"
  | "bouquet"
  | "props"
  | "groom"
  | "shoes";

export interface SelfSnapCategoryDefinition {
  id: SelfSnapItemCategory;
  label: string;
}

export const SELF_SNAP_ITEM_CATEGORIES: SelfSnapCategoryDefinition[] = [
  { id: "all", label: "전체" },
  { id: "dress", label: "셀프드레스 / 원피스" },
  { id: "veil_acc", label: "베일 & 헤어 악세서리" },
  { id: "bouquet", label: "부케 & 화관" },
  { id: "props", label: "촬영 소품 & 컨페티" },
  { id: "groom", label: "신랑 룩 & 수트" },
  { id: "shoes", label: "슈즈 & 스니커즈" },
];

export interface SelfSnapItem {
  id: string;
  name: string;
  brand: string;
  priceText?: string;
  category: "dress" | "veil_acc" | "bouquet" | "props" | "groom" | "shoes";
  moodTags: string[]; // ['#제주스냅', '#빈티지', '#블랙드레스']
  thumbnailUrl: string;
  affiliateUrl: string;
  platform?: "naver" | "ably" | "zigzag" | "brand" | "coupang" | "other";
  editorNote: string;
  tips?: string;
  isAffiliate: boolean;
  isPopular?: boolean;
  order?: number;
  createdAt?: string;
}

export type SelfSnapVenueCategory = "all" | "studio" | "hotel" | "outdoor";

export interface SelfSnapVenueCategoryDefinition {
  id: SelfSnapVenueCategory;
  label: string;
}

export const SELF_SNAP_VENUE_CATEGORIES: SelfSnapVenueCategoryDefinition[] = [
  { id: "all", label: "전체 장소" },
  { id: "studio", label: "렌탈 스튜디오" },
  { id: "hotel", label: "호텔 & 파티룸" },
  { id: "outdoor", label: "야외 스냅 명소" },
];

export type SelfSnapRegion =
  | "all"
  | "seoul_east" // 성수, 한남, 송파, 광진
  | "seoul_west" // 마포, 연남, 영등포, 상암
  | "gangnam" // 강남, 서초
  | "gyeonggi" // 경기, 인천 근교
  | "jeju" // 제주 전역
  | "busan_etc"; // 부산, 강원 및 기타

export interface SelfSnapRegionDefinition {
  id: SelfSnapRegion;
  label: string;
}

export const SELF_SNAP_REGIONS: SelfSnapRegionDefinition[] = [
  { id: "all", label: "전체 지역" },
  { id: "seoul_east", label: "서울 성수/한남" },
  { id: "seoul_west", label: "서울 마포/연남/상암" },
  { id: "gangnam", label: "서울 강남/서초" },
  { id: "gyeonggi", label: "경기/인천 근교" },
  { id: "jeju", label: "제주" },
  { id: "busan_etc", label: "부산/지방" },
];

export interface SelfSnapVenue {
  id: string;
  name: string;
  category: "studio" | "hotel" | "outdoor";
  region: SelfSnapRegion;
  regionLabel: string;
  address?: string;
  thumbnailUrl: string;
  features: string[]; // ['자연광', '호리존', '소품 완비', '주차 가능']
  priceInfo?: string; // 예: "시간당 3.5만원"
  bestTimeTip?: string; // 예: "오후 4~6시 일몰 골든아워"
  editorNote: string;
  bookingUrl?: string; // 예약 페이지 / 공식 웹사이트
  mapUrl?: string; // 네이버/카카오 지도 길찾기 링크
  isAffiliate: boolean;
  order?: number;
  createdAt?: string;
}
