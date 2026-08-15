import { describe, expect, it } from "vitest";
import geocodesJson from "../src/data/hall-venue-geocodes.generated.json";
import hallsJson from "../src/data/halls.generated.json";
import sourceJson from "../src/data/gyeonggi-halls.source.generated.json";

const excludedVenueNames = new Set([
  "골든예식장", "드라마파티컨벤션", "로즈웨딩뷔페", "송림예식장", "하우스웨딩피오레",
  "동백웨딩홀", "라페스타하우스웨딩", "밀리웨딩부페", "백암농협예식장", "용내양지예식장", "용인 농협웨딩홀",
  "남양농협웨딩홀", "이화야외예식장", "제이엘", "조암웨딩코리아",
  "CBM컨벤션웨딩부페", "김음전웨딩", "마 레지노 파주점", "새로나예식장", "스마일부페웨딩타운",
  "스마일웨딩홀", "아네뜨", "출판도시컨벤션웨딩", "파에스타9 일산탄현점", "현대예식장",
  "귀빈예식장", "너리굴문화마을 웨딩", "동성웨딩홀부페",
  "솔루나웨딩", "스카이웨딩프라자", "문화웨딩홀",
  "퀸스웨딩홀 남양주점", "두레웨딩부페", "갤러리아예식장", "삼보웨딩홀부페", "컨벤션웨딩홀 조은부페",
  "신화웨딩프라자", "파티엔블리스컨벤션", "뷰티웨딩홀 이태리부페", "더펠리체웨딩컨벤션",
  "다래이화웨딩홀", "모가농협예식장", "수영웨딩홀",
]);

describe("Gyeonggi wedding hall publication", () => {
  const gyeonggiHalls = hallsJson.filter((hall) => hall.id.startsWith("H-GG-"));
  const venueIds = new Set(gyeonggiHalls.map((hall) => hall.venueId));

  it("publishes only the verified 74 venues and 101 individual halls", () => {
    expect(sourceJson.venues).toHaveLength(74);
    expect(sourceJson.halls).toHaveLength(101);
    expect(gyeonggiHalls).toHaveLength(101);
    expect(venueIds.size).toBe(74);
  });

  it("keeps all 43 low-signal venues out of the public data", () => {
    expect(gyeonggiHalls.filter((hall) => excludedVenueNames.has(hall.venueName))).toEqual([]);
  });

  it("uses address-derived city and district labels", () => {
    for (const hall of gyeonggiHalls) {
      expect(hall.address).toMatch(/^(?:경기|경기도)\s/);
      expect(hall.district).toMatch(/(?:시|군)(?:\s+[가-힣]+구)?$/);
      expect(hall.district).not.toMatch(/권$/);
    }
  });

  it("has a verified map coordinate for every published venue", () => {
    for (const venueId of venueIds) {
      const geocode = geocodesJson[venueId as keyof typeof geocodesJson];
      expect(geocode).toBeDefined();
      expect("sourceAddress" in geocode ? geocode.sourceAddress : null).toMatch(/^(?:경기|경기도)\s/);
      expect(geocode.district).toMatch(/(?:시|군)(?:\s+[가-힣]+구)?$/);
    }
  });
});
