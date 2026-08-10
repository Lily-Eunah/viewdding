import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { halls } from "../src/lib/data";
import { restaurants } from "../src/lib/restaurants";
import { isRestaurantPublic } from "../src/domain/restaurant-normalization";

const root = process.cwd();
const output = path.join(root, "out");
const dist = process.env.SITES_DIST_DIR
  ? path.resolve(root, process.env.SITES_DIST_DIR)
  : path.join(root, "dist");

await rm(dist, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
await mkdir(path.join(dist, "client"), { recursive: true });
await mkdir(path.join(dist, "server"), { recursive: true });
await mkdir(path.join(dist, ".openai"), { recursive: true });
await cp(output, path.join(dist, "client"), { recursive: true });

const publicRestaurants = restaurants.filter(isRestaurantPublic).map((restaurant) => ({
  id: restaurant.id,
  sourceId: restaurant.sourceId,
  purpose: restaurant.purpose,
  name: restaurant.name,
  branch: restaurant.branch,
  cuisines: restaurant.cuisines,
  venueType: restaurant.venueType,
  district: restaurant.district,
  area: restaurant.area,
  address: restaurant.address,
  nearestStation: restaurant.nearestStation,
  stationExit: restaurant.stationExit,
  walkingMinutes: restaurant.walkingMinutes,
  pricePerPerson: restaurant.pricePerPerson,
  lunchPriceMin: restaurant.lunchPriceMin,
  dinnerPriceMin: restaurant.dinnerPriceMin,
  courseAvailable: restaurant.courseAvailable,
  privateRoom: restaurant.privateRoom,
  roomCapacity: restaurant.roomCapacity,
  parking: restaurant.parking,
  closedWeekdays: restaurant.closedWeekdays,
  regularClosedDaysRaw: restaurant.regularClosedDaysRaw,
  naverMapUrl: restaurant.naverMapUrl,
  kakaoMapUrl: restaurant.kakaoMapUrl,
  recommendationPoints: restaurant.recommendationPoints,
  captionTags: restaurant.captionTags,
  verifiedAt: restaurant.verifiedAt,
  latitude: restaurant.latitude,
  longitude: restaurant.longitude,
}));

const publicHalls = halls.map((hall) => ({
  id: hall.id,
  venueId: hall.venueId,
  venueName: hall.venueName,
  hallName: hall.hallName,
  sido: hall.sido,
  sigungu: hall.sigungu,
  regionCode: hall.regionCode,
  metroArea: hall.metroArea,
  district: hall.district,
  address: hall.address,
  mapUrl: hall.mapUrl,
  latitude: hall.latitude ?? null,
  longitude: hall.longitude ?? null,
  locationAddress: hall.locationAddress ?? null,
  locationPlaceUrl: hall.locationPlaceUrl ?? null,
  lighting: hall.lighting,
  naturalLight: hall.naturalLight,
  chapel: hall.chapel,
  house: hall.house,
  indoorOutdoor: hall.indoorOutdoor,
  venueType: hall.venueType,
  ceremonyFormat: hall.ceremonyFormat,
  meals: hall.meals,
  seated: hall.seated,
  capacity: hall.capacity,
  guarantee: hall.guarantee,
  interval: hall.interval,
  classificationCheckedAt: hall.classificationCheckedAt,
  detailCheckedAt: hall.detailCheckedAt,
  photos: hall.photos?.slice(0, 1).map((photo) => ({
    id: photo.id,
    url: photo.url,
    sourceUrl: photo.sourceUrl,
    sourceName: photo.sourceName,
    sourceType: photo.sourceType,
    photoKind: photo.photoKind,
    alt: photo.alt,
  })),
  raw: { mealType: hall.raw.mealType },
}));

const workerTemplate = await readFile(path.join(root, "worker", "static-site.js"), "utf8");
const workerSource = workerTemplate
  .replace("const RESTAURANTS = [];", `const RESTAURANTS = ${JSON.stringify(publicRestaurants)};`)
  .replace("const HALLS = [];", `const HALLS = ${JSON.stringify(publicHalls)};`);
await writeFile(path.join(dist, "server", "index.js"), workerSource, "utf8");
await cp(
  path.join(root, ".openai", "hosting.json"),
  path.join(dist, ".openai", "hosting.json"),
);

console.log("Staged static export for Sites deployment.");
