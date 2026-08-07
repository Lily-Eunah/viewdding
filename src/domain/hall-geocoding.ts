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
    .replace(/(?:웨딩홀|웨딩|컨벤션|호텔|예식장|서울특별시|서울시)/g, "")
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
  district: string,
  documents: KakaoKeywordDocument[],
): KakaoKeywordDocument | null {
  const ranked = documents
    .map((document) => {
      const address = document.road_address_name || document.address_name;
      const inSeoul = /^(?:서울|서울특별시)\s/.test(address);
      const inDistrict = address.includes(district);
      const similarity = venueNameSimilarity(venueName, document.place_name);
      const score = similarity + Number(inDistrict) * 0.35 + Number(inSeoul) * 0.15;
      return { document, inSeoul, inDistrict, similarity, score };
    })
    .filter((candidate) => candidate.inSeoul && candidate.inDistrict && candidate.similarity >= 0.34)
    .sort((left, right) => right.score - left.score);
  return ranked[0]?.document ?? null;
}

export function coordinatesFromKakao(x: string, y: string): { latitude: number; longitude: number } | null {
  const latitude = Number(y);
  const longitude = Number(x);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < 37.3 || latitude > 37.75 || longitude < 126.7 || longitude > 127.25) return null;
  return { latitude, longitude };
}
