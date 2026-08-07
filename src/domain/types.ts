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

export interface HallPhoto {
  id: string;
  url: string;
  sourceUrl: string;
  sourceName: string;
  sourceType: "official_website" | "official_social" | "public_listing" | "partner";
  usageStatus: HallPhotoUsageStatus;
  photoKind: "wedding_setup" | "space_overview";
  checkedAt: string;
  alt: string;
  isPrimary: boolean;
}

export interface HallRecord {
  id: string;
  venueId: string;
  venueName: string;
  hallName: string;
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
  district: string;
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
