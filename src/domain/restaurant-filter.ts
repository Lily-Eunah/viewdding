import type {
  FilteredRestaurant,
  RestaurantFilterState,
  RestaurantRecord,
} from "./restaurant-types";
import { categorizeRestaurantCuisines } from "./restaurant-cuisine";
import { isRestaurantPublic } from "./restaurant-normalization";

type MatchState = "match" | "unknown" | "mismatch";

export const EMPTY_RESTAURANT_FILTERS: RestaurantFilterState = {
  purpose: "invitation",
  district: "",
  area: "",
  weekday: null,
  cuisines: [],
  budgetMax: null,
  partySize: null,
  courseOnly: false,
  privateRoomOnly: false,
  parkingOnly: false,
};

function matchWeekday(restaurant: RestaurantRecord, filters: RestaurantFilterState): MatchState {
  if (!filters.weekday) return "match";
  if (restaurant.closedWeekdays === null) return "unknown";
  return restaurant.closedWeekdays.includes(filters.weekday) ? "mismatch" : "match";
}

function matchPartySize(restaurant: RestaurantRecord, partySize: number): MatchState {
  if (restaurant.privateRoom === "no") return "unknown";
  const { min, max } = restaurant.roomCapacity;
  if (min === null || max === null) return "unknown";
  return partySize >= min && partySize <= max ? "match" : "mismatch";
}

export function evaluateRestaurant(
  restaurant: RestaurantRecord,
  filters: RestaurantFilterState,
): FilteredRestaurant | null {
  const checks: Array<{ state: MatchState; reason: string }> = [];
  checks.push({ state: restaurant.purpose === filters.purpose ? "match" : "mismatch", reason: "모임 목적" });

  if (filters.district) {
    checks.push({ state: restaurant.district === filters.district ? "match" : "mismatch", reason: "지역" });
  }
  if (filters.area) {
    const areaMatch = restaurant.area === filters.area || restaurant.nearestStation === filters.area;
    checks.push({ state: areaMatch ? "match" : "mismatch", reason: "동네·역" });
  }
  if (filters.cuisines.length > 0) {
    const cuisineCategories = categorizeRestaurantCuisines(restaurant.cuisines);
    checks.push({
      state: filters.cuisines.some((cuisine) => cuisineCategories.includes(cuisine)) ? "match" : "mismatch",
      reason: "음식 종류",
    });
  }
  checks.push({ state: matchWeekday(restaurant, filters), reason: "방문 요일" });

  if (filters.budgetMax !== null) {
    const minimum = restaurant.pricePerPerson.min;
    checks.push({
      state: minimum === null ? "unknown" : minimum <= filters.budgetMax ? "match" : "mismatch",
      reason: "가격",
    });
  }
  if (filters.partySize !== null) {
    checks.push({ state: matchPartySize(restaurant, filters.partySize), reason: "룸 인원" });
  }
  if (filters.courseOnly) {
    checks.push({
      state: restaurant.courseAvailable === "yes" ? "match" : restaurant.courseAvailable === "unknown" ? "unknown" : "mismatch",
      reason: "코스",
    });
  }
  if (filters.privateRoomOnly) {
    checks.push({
      state: restaurant.privateRoom === "yes" ? "match" : restaurant.privateRoom === "unknown" ? "unknown" : "mismatch",
      reason: "룸",
    });
  }
  if (filters.parkingOnly) {
    checks.push({
      state: restaurant.parking === "available" || restaurant.parking === "valet"
        ? "match"
        : restaurant.parking === "unknown" ? "unknown" : "mismatch",
      reason: "주차",
    });
  }

  if (checks.some((check) => check.state === "mismatch")) return null;
  const unknownReasons = checks.filter((check) => check.state === "unknown").map((check) => check.reason);
  return { restaurant, state: unknownReasons.length > 0 ? "unknown" : "match", unknownReasons };
}

export function filterRestaurants(restaurants: RestaurantRecord[], filters: RestaurantFilterState): {
  matched: FilteredRestaurant[];
  unknown: FilteredRestaurant[];
} {
  const evaluated = restaurants
    .filter(isRestaurantPublic)
    .map((restaurant) => evaluateRestaurant(restaurant, filters))
    .filter((restaurant): restaurant is FilteredRestaurant => restaurant !== null);
  const byRecency = (a: FilteredRestaurant, b: FilteredRestaurant) =>
    (b.restaurant.verifiedAt ?? "").localeCompare(a.restaurant.verifiedAt ?? "");
  return {
    matched: evaluated.filter((item) => item.state === "match").sort(byRecency),
    unknown: evaluated.filter((item) => item.state === "unknown").sort(byRecency),
  };
}
