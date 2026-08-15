import type { NumericRange } from "./types";
import type { RestaurantCuisineCategory } from "./restaurant-cuisine";

export type GatheringPurpose = "invitation" | "family_meeting";
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type TriState = "yes" | "no" | "unknown";
export type ParkingType = "available" | "valet" | "none" | "unknown";

export interface RestaurantRecord {
  id: string;
  sourceId: string;
  status: string | null;
  purpose: GatheringPurpose;
  name: string;
  branch: string | null;
  cuisines: string[];
  venueType: string | null;
  district: string;
  area: string | null;
  address: string | null;
  nearestStation: string | null;
  stationExit: string | null;
  walkingMinutes: number | null;
  pricePerPerson: NumericRange;
  lunchPriceMin: number | null;
  dinnerPriceMin: number | null;
  courseAvailable: TriState;
  privateRoom: TriState;
  roomCapacity: NumericRange;
  parking: ParkingType;
  parkingDetail: string | null;
  closedWeekdays: Weekday[] | null;
  regularClosedDaysRaw: string | null;
  naverMapUrl: string | null;
  kakaoMapUrl: string | null;
  sourceCount: number;
  officialEvidence: string | null;
  recommendationPoints: string | null;
  captionTags: string[];
  verifiedAt: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  photoUrl?: string | null;
}

export interface RestaurantFilterState {
  keyword: string;
  purpose: GatheringPurpose;
  district: string;
  area: string;
  weekday: Weekday | null;
  cuisines: RestaurantCuisineCategory[];
  budgetMax: number | null;
  partySize: number | null;
  courseOnly: boolean;
  privateRoomOnly: boolean;
  parkingOnly: boolean;
}

export interface FilteredRestaurant {
  restaurant: RestaurantRecord;
  state: "match" | "unknown";
  unknownReasons: string[];
}
