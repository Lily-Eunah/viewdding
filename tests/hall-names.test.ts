import { describe, expect, it } from "vitest";
import halls from "../src/data/halls.generated.json";

const hallsForVenue = (venueName: string) => halls
  .filter((hall) => hall.venueName === venueName)
  .map((hall) => hall.hallName)
  .sort((left, right) => left.localeCompare(right, "ko"));

describe("hall name audit", () => {
  it("removes generated placeholder names from public data", () => {
    const invalid = halls.filter((hall) => (
      /대표 예식공간|공식 웨딩홀 미확인|홀명 확인 필요/.test(hall.hallName)
      || hall.hallName === "단독홀"
      || hall.hallName === "단독웨딩홀"
      || / 단독홀$/.test(hall.hallName)
    ));

    expect(invalid).toEqual([]);
  });

  it("assigns a structural verification status to every public hall", () => {
    expect(halls.every((hall) => ["official", "single_unnamed", "unverified"].includes(hall.hallNameStatus ?? ""))).toBe(true);
    expect(halls.filter((hall) => hall.hallNameStatus === "single_unnamed").every((hall) => hall.hallName === "단독홀(고유명칭 미공개)")).toBe(true);
    expect(halls.filter((hall) => hall.hallNameStatus === "unverified").every((hall) => hall.hallName === "홀 정보 확인 중")).toBe(true);
  });

  it("splits confirmed multi-hall venues into individual rows", () => {
    expect(hallsForVenue("벨라루체웨딩홀 서울점")).toEqual(["루체홀", "벨라홀", "플로체홀"].sort((a, b) => a.localeCompare(b, "ko")));
    expect(hallsForVenue("세인트메리엘")).toEqual(["메리엘홀", "세인트홀"].sort((a, b) => a.localeCompare(b, "ko")));
    expect(hallsForVenue("AC 호텔 바이 메리어트 서울 강남")).toEqual(["살롱 1 + 2", "클라우드"].sort((a, b) => a.localeCompare(b, "ko")));
    expect(hallsForVenue("웨스틴 조선 서울")).toEqual(["그랜드 볼룸", "라일락 홀"].sort((a, b) => a.localeCompare(b, "ko")));
    expect(hallsForVenue("오크우드 프리미어 코엑스센터")).toEqual(["오크 룸", "오크·프리미어 룸", "프리미어 룸"].sort((a, b) => a.localeCompare(b, "ko")));
  });

  it("keeps every hall id unique after splitting", () => {
    expect(new Set(halls.map((hall) => hall.id)).size).toBe(halls.length);
  });
});
