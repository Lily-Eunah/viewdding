export type LightingType = "bright" | "dark" | "transitional" | "unknown";
export type NaturalLight = "yes" | "partial" | "no" | "unknown";
export type IndoorOutdoor = "indoor" | "outdoor" | "both" | "unknown";
export type VenueType =
  | "hotel"
  | "professional_convention"
  | "public"
  | "house_venue"
  | "other"
  | "unknown";
export type CeremonyFormat = "separate" | "simultaneous" | "selectable" | "unknown";
export type MealType = "buffet" | "course" | "korean" | "catering" | "no_meal" | "other";
export type HallTypeFilter =
  | "bright"
  | "dark"
  | "chapel"
  | "house"
  | "outdoor"
  | "hotel"
  | "professional"
  | "public";

export type Sido =
  | "서울특별시"
  | "부산광역시"
  | "대구광역시"
  | "광주광역시"
  | "울산광역시"
  | "인천광역시"
  | "대전광역시"
  | "세종특별자치시"
  | "경기도"
  | "경상남도"
  | "충청남도"
  | "충청북도"
  | "제주특별자치도"
  | "전북특별자치도";

export interface NumericRange {
  min: number | null;
  max: number | null;
  raw: string | number | null;
}

export type HallPhotoUsageStatus =
  | "official_source_linked"
  | "public_source_linked"
  | "partner_provided"
  | "licensed";

export type HallPhotoIdentityStatus =
  | "hall_confirmed"
  | "venue_only"
  | "needs_review";

export type HallPhotoVerificationMethod =
  | "official_hall_page"
  | "official_named_gallery"
  | "official_single_hall_venue"
  | "public_named_listing"
  | "venue_representative"
  | "unreviewed";

export interface HallPhoto {
  id: string;
  url: string;
  sourceUrl: string;
  sourceName: string;
  sourceType: "official_website" | "official_social" | "public_listing" | "partner";
  usageStatus: HallPhotoUsageStatus;
  photoKind: "wedding_setup" | "space_overview";
  identityStatus: HallPhotoIdentityStatus;
  verificationMethod: HallPhotoVerificationMethod;
  verificationNote: string;
  checkedAt: string;
  alt: string;
  isPrimary: boolean;
}

export interface HallRecord {
  id: string;
  venueId: string;
  venueName: string;
  hallName: string;
  hallNameStatus?: "official" | "single_unnamed" | "unverified";
  hallNameSourceUrl?: string | null;
  hallNameCheckedAt?: string | null;
  hallNameEvidence?: string | null;
  sido: Sido;
  sigungu: string;
  subdistrict: string | null;
  regionCode: string;
  metroArea: string;
  /** @deprecated 화면 표시 호환용입니다. 지역 식별과 필터에는 구조화 필드를 사용하세요. */
  district: string;
  neighborhood: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  mapUrl: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationAddress?: string | null;
  locationPlaceUrl?: string | null;
  locationCheckedAt?: string | null;
  locationSourceUrl?: string | null;
  locationSourceType?: string | null;
  publicStatus: "public";
  lighting: LightingType;
  naturalLight: NaturalLight;
  chapel: boolean | null;
  house: boolean | null;
  indoorOutdoor: IndoorOutdoor;
  venueType: VenueType;
  ceremonyFormat: CeremonyFormat;
  meals: MealType[];
  seated: NumericRange;
  capacity: NumericRange;
  guarantee: NumericRange;
  interval: NumericRange;
  ceremonyTime: string | null;
  virginRoad: string | null;
  ceilingHeight: string | null;
  featureTags: string[];
  classificationEvidence: string | null;
  confidence: string | null;
  classificationCheckedAt: string | null;
  detailCheckedAt: string | null;
  sourceId: string | null;
  sourceUrl: string | null;
  sourceType: string | null;
  photos?: HallPhoto[];
  raw: {
    representativeClassification: string | null;
    lighting: string | null;
    naturalLight: string | null;
    ceremonyFormat: string | null;
    mealType: string | null;
    venueType: string | null;
  };
}

export interface FilterState {
  keyword: string;
  sidos: Sido[];
  regionCodes: string[];
  hallTypes: HallTypeFilter[];
  guests: number | null;
  naturalLight: boolean;
  ceremonyFormats: Exclude<CeremonyFormat, "unknown">[];
  intervalAtLeast: number | null;
  meals: Exclude<MealType, "no_meal" | "other">[];
}

export type MatchState = "match" | "unknown" | "mismatch";

export interface FilteredHall {
  hall: HallRecord;
  state: Exclude<MatchState, "mismatch">;
  unknownReasons: string[];
}
