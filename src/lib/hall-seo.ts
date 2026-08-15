import type { HallRecord, HallTypeFilter } from "@/domain/types";

export const HALL_SEO_SLUGS = ["bright", "outdoor", "dark", "chapel"] as const;

export type HallSeoSlug = (typeof HALL_SEO_SLUGS)[number];
export type HallSeoCollectionKey = "all" | HallSeoSlug;

export const HALL_SEO_COLLECTION_ORDER: readonly HallSeoCollectionKey[] = ["all", ...HALL_SEO_SLUGS];

export type HallSeoConfig = {
  key: HallSeoCollectionKey;
  slug: HallSeoSlug | null;
  heading: string;
  titleLabel: string;
  eyebrow: string;
  searchTerms: string;
  definitionTitle: string;
  definition: string;
  note: string;
  filterType: HallTypeFilter | null;
};

const CONFIGS: Record<HallSeoCollectionKey, HallSeoConfig> = {
  all: {
    key: "all",
    slug: null,
    heading: "서울 웨딩홀 리스트",
    titleLabel: "서울 웨딩홀 리스트",
    eyebrow: "VIEWDDING · SEOUL WEDDING HALLS",
    searchTerms: "서울 웨딩홀과 서울 예식장",
    definitionTitle: "서울 웨딩홀을 개별홀 기준으로 정리했어요",
    definition: "Viewdding은 같은 예식장 안의 서로 다른 홀을 한곳으로 합치지 않고 개별홀 단위로 보여줍니다. 지역과 홀 분위기뿐 아니라 수용인원, 예식간격, 예식 형태와 식사 정보를 함께 비교할 수 있습니다.",
    note: "운영 여부와 공개 준비 상태가 확인된 홀만 포함하며, 확인되지 않은 값은 임의로 추정하지 않습니다.",
    filterType: null,
  },
  bright: {
    key: "bright",
    slug: "bright",
    heading: "서울 밝은 웨딩홀 리스트",
    titleLabel: "서울 밝은 웨딩홀 리스트",
    eyebrow: "VIEWDDING · BRIGHT WEDDING HALLS",
    searchTerms: "서울 밝은홀과 서울 밝은 웨딩홀",
    definitionTitle: "밝은홀은 이렇게 분류했어요",
    definition: "밝은 조명 연출이 중심이거나 자연광과 밝은 공간감이 확인된 홀을 모았습니다. 조도 전환이 가능한 홀은 밝은 연출이 가능하므로 밝은홀 목록에도 함께 포함합니다.",
    note: "자연광 여부는 조도와 별도 항목입니다. 자연광이 확인되지 않아도 밝은 조명과 공간 연출이 확인되면 밝은홀로 분류될 수 있습니다.",
    filterType: "bright",
  },
  dark: {
    key: "dark",
    slug: "dark",
    heading: "서울 어두운 웨딩홀 리스트",
    titleLabel: "서울 어두운 웨딩홀 리스트",
    eyebrow: "VIEWDDING · DARK WEDDING HALLS",
    searchTerms: "서울 어두운홀과 서울 어두운 웨딩홀",
    definitionTitle: "어두운홀은 이렇게 분류했어요",
    definition: "집중 조명과 어두운 배경을 중심으로 예식을 연출하는 홀을 모았습니다. 조도 전환이 가능한 홀은 어두운 연출도 가능하므로 어두운홀 목록에도 함께 포함합니다.",
    note: "전환형 홀은 밝은홀과 어두운홀 양쪽에 포함됩니다. 실제 예식 조도와 연출 가능 범위는 상담 시 다시 확인해 주세요.",
    filterType: "dark",
  },
  chapel: {
    key: "chapel",
    slug: "chapel",
    heading: "서울 채플홀 리스트",
    titleLabel: "서울 채플홀 리스트",
    eyebrow: "VIEWDDING · CHAPEL WEDDING HALLS",
    searchTerms: "서울 채플홀과 채플 스타일 웨딩홀",
    definitionTitle: "채플홀은 이렇게 분류했어요",
    definition: "공식 명칭이나 공간 설명, 최근 홀 사진에서 채플 스타일이 확인된 개별홀을 모았습니다. 긴 버진로드나 높은 천고만으로 채플홀이라고 추정하지 않습니다.",
    note: "채플 스타일은 밝기와 별도 분류입니다. 같은 채플홀이라도 밝은홀, 어두운홀 또는 전환형홀일 수 있습니다.",
    filterType: "chapel",
  },
  outdoor: {
    key: "outdoor",
    slug: "outdoor",
    heading: "서울 야외 웨딩홀 리스트",
    titleLabel: "서울 야외 웨딩홀 리스트",
    eyebrow: "VIEWDDING · OUTDOOR WEDDING HALLS",
    searchTerms: "서울 야외 웨딩홀과 야외예식 가능한 장소",
    definitionTitle: "야외 웨딩홀은 이렇게 분류했어요",
    definition: "야외 공간에서 본식을 진행할 수 있거나 실내외 예식을 함께 운영하는 홀이 포함됩니다. 단순 야외 촬영 공간이나 테라스만 있는 경우는 야외예식 가능 홀로 분류하지 않습니다.",
    note: "야외예식 운영 시기와 우천 대안, 식사 방식은 장소와 날짜에 따라 달라질 수 있으므로 계약 전에 확인해 주세요.",
    filterType: "outdoor",
  },
};

export function isHallSeoSlug(value: string): value is HallSeoSlug {
  return HALL_SEO_SLUGS.includes(value as HallSeoSlug);
}

export function getHallSeoConfig(key: HallSeoCollectionKey): HallSeoConfig {
  return CONFIGS[key];
}

export function hallMatchesSeoCollection(hall: HallRecord, key: HallSeoCollectionKey): boolean {
  switch (key) {
    case "all":
      return true;
    case "bright":
      return hall.lighting === "bright" || hall.lighting === "transitional";
    case "dark":
      return hall.lighting === "dark" || hall.lighting === "transitional";
    case "chapel":
      return hall.chapel === true;
    case "outdoor":
      return hall.indoorOutdoor === "outdoor" || hall.indoorOutdoor === "both";
  }
}

export function hallSeoPath(key: HallSeoCollectionKey): string {
  return key === "all" ? "/seoul/wedding-halls/" : `/seoul/wedding-halls/${key}/`;
}

export function hallSeoSearchHref(key: HallSeoCollectionKey): string {
  const filterType = CONFIGS[key].filterType;
  return filterType ? `/search/?types=${filterType}` : "/search/";
}

export function collectionHalls(allHalls: HallRecord[], key: HallSeoCollectionKey): HallRecord[] {
  return allHalls
    .filter((hall) => hallMatchesSeoCollection(hall, key))
    .toSorted((a, b) => (
      a.district.localeCompare(b.district, "ko")
      || a.venueName.localeCompare(b.venueName, "ko")
      || a.hallName.localeCompare(b.hallName, "ko")
    ));
}

export function collectionVenueCount(collection: HallRecord[]): number {
  return new Set(collection.map((hall) => hall.venueId)).size;
}

export function collectionUpdatedAt(collection: HallRecord[], fallback: string): string {
  return collection
    .flatMap((hall) => [hall.detailCheckedAt, hall.classificationCheckedAt, hall.locationCheckedAt])
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? fallback.slice(0, 10);
}
