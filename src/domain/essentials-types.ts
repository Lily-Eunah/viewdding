export interface StageDefinition {
  id: string;
  label: string;
  englishLabel: string;
  description: string;
  order: number;
}

export const ESSENTIAL_STAGES: StageDefinition[] = [
  {
    id: "all",
    label: "전체",
    englishLabel: "All Items",
    description: "결혼 준비 전 과정의 모든 추천 아이템",
    order: 0,
  },
  {
    id: "dress_tour",
    label: "드레스 투어",
    englishLabel: "Dress Tour",
    description: "피팅 라인을 살리고 탈의가 편한 필수 이너 & 소품",
    order: 1,
  },
  {
    id: "studio_snap",
    label: "촬영 & 스냅",
    englishLabel: "Studio & Snap",
    description: "완벽한 바디 라인과 무결점 연출을 위한 촬영 필수템",
    order: 2,
  },
  {
    id: "wedding_day",
    label: "본식 당일",
    englishLabel: "D-Day Ceremony",
    description: "가장 특별한 날, 단 하나의 빈틈도 없는 무결점 세팅",
    order: 3,
  },
  {
    id: "honeymoon",
    label: "신혼여행",
    englishLabel: "Honeymoon",
    description: "편안하고 로맨틱한 허니문을 위한 꿀템",
    order: 4,
  },
  {
    id: "pre_care",
    label: "D-30 케어",
    englishLabel: "Pre-Wedding Care",
    description: "메이크업과 드레스 핏을 완성하는 홈케어 & 뷰티",
    order: 5,
  },
];

export type EssentialCategory = "innerwear" | "beauty" | "supplies" | "travel";

export interface EssentialCategoryDefinition {
  id: string;
  label: string;
}

export const ESSENTIAL_CATEGORIES: EssentialCategoryDefinition[] = [
  { id: "all", label: "전체" },
  { id: "innerwear", label: "속옷 / 보정" },
  { id: "beauty", label: "뷰티 / 렌즈 / 선케어" },
  { id: "supplies", label: "현장 소품 / 비상약" },
  { id: "travel", label: "여행 / 라이프" },
];

export interface WeddingEssentialItem {
  id: string;
  name: string;
  brand: string;
  priceText?: string;
  stages: string[]; // ['dress_tour', 'studio_snap']
  category: EssentialCategory;
  thumbnailUrl: string;
  affiliateUrl: string;
  platform?: "naver" | "coupang" | "oliveyoung" | "dorosiwa" | "uniqlo" | "brand" | "other";
  editorNote: string;
  tips?: string;
  tags: string[];
  isAffiliate: boolean; // true: 제휴 링크, false: 순수 큐레이션
  isMustHave?: boolean; // 필수 준비물 뱃지
  order?: number;
  createdAt?: string;
}
