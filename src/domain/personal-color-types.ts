export type PersonalColorStatus = "recommended" | "verify_booking" | "on_hold";
export type VerificationGrade = "A" | "B" | "C";

export type PersonalColorServiceTag =
  | "color"        // 퍼스널컬러
  | "body_shape"   // 골격 / 체형 진단
  | "dress"        // 웨딩드레스 라인 / 소재 / 넥라인
  | "makeup_hair"  // 메이크업 & 헤어 / 염색
  | "couple"       // 신랑 예복 / 커플 진단
  | "total_wedding"; // 토탈 웨딩 컨설팅 (부케, 액세서리, 스튜디오 등)

export interface PersonalColorRecord {
  id: string;
  sourceId: string;
  status: PersonalColorStatus;
  statusRaw: string;
  name: string;
  sido: string;
  sigungu: string;
  district: string;
  address: string;
  evidence: string;
  services: string[];
  serviceTags: PersonalColorServiceTag[];
  priceRaw: string;
  priceEstimatedMin: number | null;
  priceEstimatedMax: number | null;
  naverMapUrl: string | null;
  reviewUrl: string | null;
  instagramUrl: string | null;
  grade: VerificationGrade;
  verifiedAt: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  photoUrl?: string | null;
}

export interface PersonalColorFilterState {
  keyword: string;
  sido: string;
  district: string;
  serviceTags: PersonalColorServiceTag[];
  priceBudgetMax: number | null;
  gradeAOnly: boolean;
  includeOnHold: boolean;
}

export interface FilteredPersonalColor {
  vendor: PersonalColorRecord;
  state: "match" | "unknown";
  unknownReasons: string[];
}

export interface FilterPersonalColorsResult {
  matched: FilteredPersonalColor[];
  unknown: FilteredPersonalColor[];
}
