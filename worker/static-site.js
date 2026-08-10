const RESTAURANTS = [];
const HALLS = [];
const LIST_LIMIT_MAX = 48;
const MAP_LIMIT = 250;

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "private, no-store",
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}

function strings(params, key, allowed) {
  const values = params.getAll(key).flatMap((value) => value.split(",")).filter(Boolean);
  return allowed ? values.filter((value) => allowed.has(value)) : values;
}

function numberParam(params, key, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = params.get(key);
  if (raw === null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : null;
}

function booleanParam(params, key) {
  return params.get(key) === "1";
}

function boundsFromParams(params) {
  const south = numberParam(params, "south", { min: -90, max: 90 });
  const west = numberParam(params, "west", { min: -180, max: 180 });
  const north = numberParam(params, "north", { min: -90, max: 90 });
  const east = numberParam(params, "east", { min: -180, max: 180 });
  if (south === null || west === null || north === null || east === null || south > north || west > east) return null;
  return { south, west, north, east };
}

function insideBounds(item, bounds) {
  if (!bounds) return true;
  return item.latitude !== null && item.longitude !== null
    && item.latitude >= bounds.south && item.latitude <= bounds.north
    && item.longitude >= bounds.west && item.longitude <= bounds.east;
}

function restaurantCuisineCategories(cuisines) {
  const source = cuisines.join(" ");
  const categories = new Set();
  if (/한식|한우|한정식|갈비|삼겹|돼지|목살|소고기|고기|곱창|막창|족발|보쌈|국밥|곰탕|냉면|수육|전골|닭갈비|백숙|삼계탕|육개장|비빔밥|솥밥|코다리|아구찜|해장국|흑염소|쌈밥|낙곱새|낙지볶음|편백찜|전통주|막걸리|보리굴비|남도|제철회|숙성회|해산물|간장게장|고깃집/.test(source)) categories.add("한식");
  if (/일식|일본|이자카야|스시|사시미|초밥|오마카세|야키니쿠|스키야키|샤브샤브|돈카츠|우동|소바|카이센|후토마끼|참치|회|장어|나베|덮밥|호루몬/.test(source)) categories.add("일식");
  if (/중식|중국|딤섬|마라|훠궈|탕수육|짜장|광동|광둥|홍콩|누룽지탕/.test(source)) categories.add("중식");
  if (/양식|이탈리|파스타|피자|스테이크|프렌치|브런치|유러피안|비스트로|리소토|리조또|리조토|뇨끼|샐러드|샌드위치|아메리칸|미국식|와인|필라프|치킨스테이크/.test(source)) categories.add("양식");
  if (/태국|베트남|인도|아시안|월남쌈/.test(source)) categories.add("아시아 음식");
  if (/멕시|스페인|브라질|체코|쿠바|지중해|슈하스코|타파스/.test(source)) categories.add("세계 음식");
  if (/카페|디저트|베이커리/.test(source)) categories.add("카페·디저트");
  if (categories.size === 0) categories.add("기타");
  return categories;
}

function evaluateRestaurant(restaurant, filters) {
  const unknownReasons = [];
  if (restaurant.purpose !== filters.purpose) return null;
  if (filters.district && restaurant.district !== filters.district) return null;
  if (filters.area && restaurant.area !== filters.area && restaurant.nearestStation !== filters.area) return null;
  if (filters.cuisines.length > 0) {
    const categories = restaurantCuisineCategories(restaurant.cuisines);
    if (!filters.cuisines.some((cuisine) => categories.has(cuisine))) return null;
  }
  if (filters.weekday) {
    if (restaurant.closedWeekdays === null) unknownReasons.push("방문 요일");
    else if (restaurant.closedWeekdays.includes(filters.weekday)) return null;
  }
  if (filters.budgetMax !== null) {
    if (restaurant.pricePerPerson.min === null) unknownReasons.push("가격");
    else if (restaurant.pricePerPerson.min > filters.budgetMax) return null;
  }
  if (filters.partySize !== null) {
    const { min, max } = restaurant.roomCapacity;
    if (restaurant.privateRoom === "no" || min === null || max === null) unknownReasons.push("룸 인원");
    else if (filters.partySize < min || filters.partySize > max) return null;
  }
  if (filters.courseOnly) {
    if (restaurant.courseAvailable === "unknown") unknownReasons.push("코스");
    else if (restaurant.courseAvailable !== "yes") return null;
  }
  if (filters.privateRoomOnly) {
    if (restaurant.privateRoom === "unknown") unknownReasons.push("룸");
    else if (restaurant.privateRoom !== "yes") return null;
  }
  if (filters.parkingOnly) {
    if (restaurant.parking === "unknown") unknownReasons.push("주차");
    else if (restaurant.parking !== "available" && restaurant.parking !== "valet") return null;
  }
  return { restaurant, state: unknownReasons.length ? "unknown" : "match", unknownReasons };
}

function restaurantFilters(params) {
  const purpose = params.get("purpose") === "family_meeting" ? "family_meeting" : "invitation";
  return {
    purpose,
    district: (params.get("district") ?? "").slice(0, 30),
    area: (params.get("area") ?? "").slice(0, 50),
    weekday: strings(params, "weekday", new Set(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]))[0] ?? null,
    cuisines: strings(params, "cuisines", new Set(["한식", "일식", "중식", "양식", "아시아 음식", "세계 음식", "카페·디저트", "기타"])),
    budgetMax: numberParam(params, "budget", { min: 0, max: 10000000 }),
    partySize: numberParam(params, "party", { min: 1, max: 10000 }),
    courseOnly: booleanParam(params, "course"),
    privateRoomOnly: booleanParam(params, "room"),
    parkingOnly: booleanParam(params, "parking"),
  };
}

function restaurantResults(params) {
  const evaluated = RESTAURANTS.map((restaurant) => evaluateRestaurant(restaurant, restaurantFilters(params))).filter(Boolean);
  const byRecency = (left, right) => (right.restaurant.verifiedAt ?? "").localeCompare(left.restaurant.verifiedAt ?? "");
  return {
    matched: evaluated.filter((item) => item.state === "match").sort(byRecency),
    unknown: evaluated.filter((item) => item.state === "unknown").sort(byRecency),
  };
}

function combine(states) {
  if (states.includes("match")) return "match";
  if (states.includes("unknown")) return "unknown";
  return "mismatch";
}

function hallTypeState(hall, type) {
  if (type === "bright") return hall.lighting === "bright" || hall.lighting === "transitional" ? "match" : hall.lighting === "unknown" ? "unknown" : "mismatch";
  if (type === "dark") return hall.lighting === "dark" || hall.lighting === "transitional" ? "match" : hall.lighting === "unknown" ? "unknown" : "mismatch";
  if (type === "chapel") return hall.chapel === true ? "match" : hall.chapel === null ? "unknown" : "mismatch";
  if (type === "house") return hall.house === true ? "match" : hall.house === null ? "unknown" : "mismatch";
  if (type === "outdoor") return hall.indoorOutdoor === "outdoor" || hall.indoorOutdoor === "both" ? "match" : hall.indoorOutdoor === "unknown" ? "unknown" : "mismatch";
  if (type === "hotel") return hall.venueType === "hotel" ? "match" : hall.venueType === "unknown" ? "unknown" : "mismatch";
  if (type === "professional") return hall.venueType === "professional_convention" ? "match" : hall.venueType === "unknown" ? "unknown" : "mismatch";
  return hall.venueType === "public" ? "match" : hall.venueType === "unknown" ? "unknown" : "mismatch";
}

function evaluateHall(hall, filters) {
  const checks = [];
  if (filters.sidos.length || filters.regionCodes.length) checks.push([filters.sidos.includes(hall.sido) || filters.regionCodes.includes(hall.regionCode) ? "match" : "mismatch", "지역"]);
  for (const group of [["bright", "dark"], ["chapel", "house", "outdoor"], ["hotel", "professional", "public"]]) {
    const selected = filters.hallTypes.filter((type) => group.includes(type));
    if (selected.length) checks.push([combine(selected.map((type) => hallTypeState(hall, type))), "웨딩홀 타입"]);
  }
  if (filters.guests !== null) {
    const capacity = hall.capacity.max;
    const guarantee = hall.guarantee.min;
    if ((capacity !== null && filters.guests > capacity) || (guarantee !== null && filters.guests < guarantee)) checks.push(["mismatch", "수용·보증인원"]);
    else if (capacity === null || guarantee === null || (hall.guarantee.max !== null && hall.guarantee.max !== guarantee && filters.guests < hall.guarantee.max)) checks.push(["unknown", "수용·보증인원"]);
    else checks.push(["match", "수용·보증인원"]);
  }
  if (filters.naturalLight) checks.push([hall.naturalLight === "yes" || hall.naturalLight === "partial" ? "match" : hall.naturalLight === "unknown" ? "unknown" : "mismatch", "자연광"]);
  if (filters.ceremonyFormats.length) checks.push([hall.ceremonyFormat === "unknown" ? "unknown" : hall.ceremonyFormat === "selectable" || filters.ceremonyFormats.includes(hall.ceremonyFormat) ? "match" : "mismatch", "예식 형태"]);
  if (filters.intervalAtLeast !== null) {
    const { min, max } = hall.interval;
    checks.push([min === null || max === null ? "unknown" : min >= filters.intervalAtLeast ? "match" : max < filters.intervalAtLeast ? "mismatch" : "unknown", "예식 간격"]);
  }
  if (filters.meals.length) checks.push([hall.meals.length === 0 ? "unknown" : filters.meals.some((meal) => hall.meals.includes(meal)) ? "match" : "mismatch", "식사 유형"]);
  if (checks.some(([state]) => state === "mismatch")) return null;
  const unknownReasons = checks.filter(([state]) => state === "unknown").map(([, reason]) => reason);
  return { hall, state: unknownReasons.length ? "unknown" : "match", unknownReasons };
}

function hallFilters(params) {
  return {
    sidos: strings(params, "sido"),
    regionCodes: strings(params, "region"),
    hallTypes: strings(params, "types", new Set(["bright", "dark", "chapel", "house", "outdoor", "hotel", "professional", "public"])),
    guests: numberParam(params, "guests", { min: 1, max: 100000 }),
    naturalLight: booleanParam(params, "natural"),
    ceremonyFormats: strings(params, "ceremony", new Set(["separate", "simultaneous", "selectable"])),
    intervalAtLeast: numberParam(params, "interval", { min: 0, max: 1440 }),
    meals: strings(params, "meals", new Set(["buffet", "course", "korean", "catering"])),
  };
}

function hallResults(params) {
  const evaluated = HALLS.map((hall) => evaluateHall(hall, hallFilters(params))).filter(Boolean);
  const byRecency = (left, right) => (right.hall.detailCheckedAt ?? right.hall.classificationCheckedAt ?? "").localeCompare(left.hall.detailCheckedAt ?? left.hall.classificationCheckedAt ?? "");
  return {
    matched: evaluated.filter((item) => item.state === "match").sort(byRecency),
    unknown: evaluated.filter((item) => item.state === "unknown").sort(byRecency),
  };
}

function counts(results) {
  return { matched: results.matched.length, unknown: results.unknown.length, total: results.matched.length + results.unknown.length };
}

function listPayload(results, params) {
  const offset = numberParam(params, "offset", { min: 0, max: 100000 }) ?? 0;
  const limit = numberParam(params, "limit", { min: 1, max: LIST_LIMIT_MAX }) ?? 24;
  return {
    matched: results.matched.slice(offset, offset + limit),
    unknown: offset === 0 ? results.unknown.slice(0, limit) : [],
    counts: counts(results),
    nextOffset: offset + limit < results.matched.length ? offset + limit : null,
  };
}

function groupHallVenues(items) {
  const grouped = new Map();
  for (const item of items) {
    const hall = item.hall;
    if (!insideBounds(hall, item.bounds)) continue;
    const publicItem = { hall, state: item.state, unknownReasons: item.unknownReasons };
    const current = grouped.get(hall.venueId);
    if (current) current.halls.push(publicItem);
    else grouped.set(hall.venueId, {
      venueId: hall.venueId,
      venueName: hall.venueName,
      district: hall.district,
      address: hall.locationAddress ?? hall.address,
      latitude: hall.latitude,
      longitude: hall.longitude,
      placeUrl: hall.locationPlaceUrl ?? hall.mapUrl,
      halls: [publicItem],
    });
  }
  return Array.from(grouped.values()).sort((left, right) => left.district.localeCompare(right.district, "ko") || left.venueName.localeCompare(right.venueName, "ko"));
}

function handleRestaurants(params) {
  const results = restaurantResults(params);
  if (params.get("mode") === "count") return json({ counts: counts(results) });
  if (params.get("mode") === "map") {
    const bounds = boundsFromParams(params);
    const all = [...results.matched, ...results.unknown].filter((item) => insideBounds(item.restaurant, bounds));
    const items = all.slice(0, MAP_LIMIT).map((item) => item.restaurant);
    return json({ items, counts: counts(results), shown: items.length, truncated: all.length > MAP_LIMIT });
  }
  return json(listPayload(results, params));
}

function handleHalls(params) {
  if (params.get("mode") === "favorites") {
    const requestedIds = strings(params, "id").slice(0, 100);
    const requested = new Set(requestedIds);
    const halls = HALLS.filter((hall) => requested.has(hall.id)).map((hall) => ({ hall, state: "match", unknownReasons: [] }));
    return json({ halls });
  }
  const results = hallResults(params);
  if (params.get("mode") === "count") return json({ counts: counts(results) });
  if (params.get("mode") === "map") {
    const bounds = boundsFromParams(params);
    const bounded = [...results.matched, ...results.unknown].map((item) => ({ ...item, bounds }));
    const venues = groupHallVenues(bounded).slice(0, MAP_LIMIT);
    return json({ venues, counts: counts(results), shown: venues.length, truncated: venues.length === MAP_LIMIT });
  }
  return json(listPayload(results, params));
}

function handleMeta() {
  const restaurantDistricts = {};
  const restaurantAreas = {};
  for (const purpose of ["invitation", "family_meeting"]) {
    const scoped = RESTAURANTS.filter((restaurant) => restaurant.purpose === purpose);
    restaurantDistricts[purpose] = Array.from(new Set(scoped.map((restaurant) => restaurant.district))).sort((a, b) => a.localeCompare(b, "ko"));
    restaurantAreas[purpose] = {};
    for (const district of restaurantDistricts[purpose]) {
      restaurantAreas[purpose][district] = Array.from(new Set(scoped.filter((restaurant) => restaurant.district === district).flatMap((restaurant) => [restaurant.area, restaurant.nearestStation]).filter(Boolean))).sort((a, b) => a.localeCompare(b, "ko"));
    }
  }
  const venueIdsBySido = new Map();
  const venueIdsByRegion = new Map();
  for (const hall of HALLS) {
    if (!venueIdsBySido.has(hall.sido)) venueIdsBySido.set(hall.sido, new Set());
    if (!venueIdsByRegion.has(hall.regionCode)) venueIdsByRegion.set(hall.regionCode, new Set());
    venueIdsBySido.get(hall.sido).add(hall.venueId);
    venueIdsByRegion.get(hall.regionCode).add(hall.venueId);
  }
  return json({
    restaurants: { districts: restaurantDistricts, areas: restaurantAreas },
    halls: {
      availableSidos: Array.from(venueIdsBySido.keys()),
      sidoVenueCounts: Object.fromEntries(Array.from(venueIdsBySido, ([key, value]) => [key, value.size])),
      regionVenueCounts: Object.fromEntries(Array.from(venueIdsByRegion, ([key, value]) => [key, value.size])),
    },
  });
}

function apiResponse(url) {
  if (url.pathname === "/api/search/meta") return handleMeta();
  if (url.pathname === "/api/restaurants/search") return handleRestaurants(url.searchParams);
  if (url.pathname === "/api/halls/search") return handleHalls(url.searchParams);
  return json({ error: "Not found" }, 404);
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      return apiResponse(url);
    }

    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404) {
      return response;
    }

    if (!url.pathname.endsWith("/")) {
      url.pathname = `${url.pathname}/`;
      const directoryResponse = await env.ASSETS.fetch(new Request(url, request));
      if (directoryResponse.status !== 404) {
        return directoryResponse;
      }
    }

    const notFoundUrl = new URL("/404.html", request.url);
    const notFound = await env.ASSETS.fetch(new Request(notFoundUrl, request));
    return new Response(notFound.body, {
      status: 404,
      headers: notFound.headers,
    });
  },
};

export default worker;

export { apiResponse, evaluateHall, evaluateRestaurant };
