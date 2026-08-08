import type { RegionFields } from "./regions";

export interface KakaoKeywordDocument {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
}

export interface HallVenueGeocode {
  venueId: string;
  venueName: string;
  district: string;
  latitude: number;
  longitude: number;
  matchedAddress: string;
  matchedPlaceName: string | null;
  placeUrl: string;
  query: string;
  method: "address" | "keyword";
  provider: "kakao";
  checkedAt: string;
  sourceAddress?: string;
  sourceUrl?: string;
  sourceType?: "official_public" | "official_venue" | "official_map" | "verified_directory";
}

export function normalizeVenueSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, "")
    .replace(/(?:웨딩홀|웨딩|컨벤션|호텔|예식장|서울특별시|서울시|경기도|경기|인천광역시|인천시|인천|부산광역시|부산시|부산|경상남도|경남|대전광역시|대전시|대전|세종특별자치시|세종시|세종|대구광역시|대구시|대구)/g, "")
    .replace(/[^a-z0-9가-힣]/g, "");
}

function bigrams(value: string): string[] {
  if (value.length < 2) return value ? [value] : [];
  return Array.from({ length: value.length - 1 }, (_, index) => value.slice(index, index + 2));
}

export function venueNameSimilarity(left: string, right: string): number {
  const normalizedLeft = normalizeVenueSearchText(left);
  const normalizedRight = normalizeVenueSearchText(right);
  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 1;
  if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) return 0.92;
  const leftBigrams = bigrams(normalizedLeft);
  const remaining = bigrams(normalizedRight);
  let intersection = 0;
  for (const pair of leftBigrams) {
    const index = remaining.indexOf(pair);
    if (index >= 0) {
      intersection += 1;
      remaining.splice(index, 1);
    }
  }
  return (2 * intersection) / (leftBigrams.length + bigrams(normalizedRight).length);
}

export function selectKakaoVenueDocument(
  venueName: string,
  region: Pick<RegionFields, "sido" | "sigungu" | "subdistrict"> | string,
  documents: KakaoKeywordDocument[],
): KakaoKeywordDocument | null {
  const ranked = documents
    .map((document) => {
      const address = document.road_address_name || document.address_name;
      const inServiceArea = isSupportedRegionAddress(address);
      const inRegion = typeof region === "string"
        ? address.includes(region)
        : addressMatchesHallRegion(address, region);
      const similarity = venueNameSimilarity(venueName, document.place_name);
      const score = similarity + Number(inRegion) * 0.35 + Number(inServiceArea) * 0.15;
      return { document, inServiceArea, inRegion, similarity, score };
    })
    .filter((candidate) => candidate.inServiceArea && candidate.inRegion && candidate.similarity >= 0.34)
    .sort((left, right) => right.score - left.score);
  return ranked[0]?.document ?? null;
}

export function isSupportedRegionAddress(address: string): boolean {
  return /^(?:서울|서울특별시|경기|경기도|인천|인천광역시|부산|부산광역시|경남|경상남도|대전|대전광역시|세종|세종특별자치시|대구|대구광역시)(?:\s|$)/.test(address.trim());
}

/** @deprecated Use isSupportedRegionAddress for the nationwide expansion. */
export const isCapitalAreaAddress = isSupportedRegionAddress;

export function addressMatchesHallRegion(
  address: string,
  region: Pick<RegionFields, "sido" | "sigungu" | "subdistrict">,
): boolean {
  const sidoPattern: Record<RegionFields["sido"], RegExp> = {
    서울특별시: /^(?:서울|서울특별시)(?:\s|$)/,
    경기도: /^(?:경기|경기도)(?:\s|$)/,
    인천광역시: /^(?:인천|인천광역시)(?:\s|$)/,
    부산광역시: /^(?:부산|부산광역시)(?:\s|$)/,
    경상남도: /^(?:경남|경상남도)(?:\s|$)/,
    대전광역시: /^(?:대전|대전광역시)(?:\s|$)/,
    세종특별자치시: /^(?:세종|세종특별자치시)(?:\s|$)/,
    대구광역시: /^(?:대구|대구광역시)(?:\s|$)/,
  };
  const normalized = address.trim();
  return sidoPattern[region.sido].test(normalized)
    && (region.sido === "세종특별자치시" || normalized.includes(region.sigungu))
    && (!region.subdistrict || normalized.includes(region.subdistrict));
}

export function coordinatesFromKakao(x: string, y: string): { latitude: number; longitude: number } | null {
  const latitude = Number(y);
  const longitude = Number(x);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < 33 || latitude > 39 || longitude < 124 || longitude > 132) return null;
  return { latitude, longitude };
}
