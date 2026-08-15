import { describe, expect, it } from "vitest";
import {
  EMPTY_PERSONAL_COLOR_FILTERS,
  filterPersonalColors,
} from "../src/domain/personal-color-filter";
import { personalColorsWithinBounds } from "../src/domain/personal-color-map";
import type { PersonalColorRecord } from "../src/domain/personal-color-types";

const mockVendors: PersonalColorRecord[] = [
  {
    id: "WD-001",
    sourceId: "WD-001",
    status: "recommended",
    statusRaw: "게재 권장",
    name: "희플레이스",
    sido: "서울",
    sigungu: "성동구",
    district: "서울 성동구",
    address: "서울 성동구 홍익동",
    evidence: "웨딩 퍼스널컬러 진단 후기 확인",
    services: ["퍼스널컬러", "웨딩 스타일링(드레스", "메이크업 시안)"],
    serviceTags: ["color", "dress", "makeup_hair"],
    priceRaw: "문의",
    priceEstimatedMin: null,
    priceEstimatedMax: null,
    naverMapUrl: "https://map.naver.com",
    reviewUrl: null,
    instagramUrl: "https://instagram.com",
    grade: "B",
    verifiedAt: "2026-08-13",
    notes: null,
    latitude: 37.5663,
    longitude: 127.0322,
    active: true,
  },
  {
    id: "WD-002",
    sourceId: "WD-002",
    status: "recommended",
    statusRaw: "게재 권장",
    name: "몽끄컬러랩 압구정점",
    sido: "서울",
    sigungu: "강남구",
    district: "서울 강남구",
    address: "서울 강남구 압구정권",
    evidence: "웨딩컨설팅 상품·후기 확인",
    services: ["퍼스널컬러", "골격", "웨딩컨설팅"],
    serviceTags: ["color", "body_shape", "total_wedding"],
    priceRaw: "약 25만원/2시간(후기 참고)",
    priceEstimatedMin: 250000,
    priceEstimatedMax: 250000,
    naverMapUrl: "https://map.naver.com",
    reviewUrl: null,
    instagramUrl: null,
    grade: "A",
    verifiedAt: "2026-08-13",
    notes: null,
    latitude: 37.5270,
    longitude: 127.0284,
    active: true,
  },
  {
    id: "WD-003",
    sourceId: "WD-003",
    status: "on_hold",
    statusRaw: "보류",
    name: "보류업체",
    sido: "인천",
    sigungu: "남동구",
    district: "인천 남동구",
    address: "인천 남동구 구월동",
    evidence: "일반 퍼스널컬러만 확인",
    services: ["일반 퍼스널컬러"],
    serviceTags: ["color"],
    priceRaw: "79,000원",
    priceEstimatedMin: 79000,
    priceEstimatedMax: 79000,
    naverMapUrl: null,
    reviewUrl: null,
    instagramUrl: null,
    grade: "C",
    verifiedAt: "2026-08-14",
    notes: "웨딩 전용 미확인",
    latitude: 37.4470,
    longitude: 126.7314,
    active: false,
  },
];

describe("Wedding Personal Color Filters", () => {
  it("excludes on_hold status by default", () => {
    const result = filterPersonalColors(mockVendors, EMPTY_PERSONAL_COLOR_FILTERS);
    expect(result.matched.length).toBe(2);
    expect(result.matched.map((m) => m.vendor.id)).toEqual(["WD-001", "WD-002"]);
  });

  it("includes on_hold status when includeOnHold is true", () => {
    const result = filterPersonalColors(mockVendors, {
      ...EMPTY_PERSONAL_COLOR_FILTERS,
      includeOnHold: true,
    });
    expect(result.matched.length).toBe(3);
  });

  it("filters by keyword search (name, region, service)", () => {
    const byName = filterPersonalColors(mockVendors, {
      ...EMPTY_PERSONAL_COLOR_FILTERS,
      keyword: "몽끄",
    });
    expect(byName.matched.length).toBe(1);
    expect(byName.matched[0].vendor.id).toBe("WD-002");

    const byRegion = filterPersonalColors(mockVendors, {
      ...EMPTY_PERSONAL_COLOR_FILTERS,
      keyword: "성동구",
    });
    expect(byRegion.matched.length).toBe(1);
    expect(byRegion.matched[0].vendor.id).toBe("WD-001");
  });

  it("filters by service tags", () => {
    const bodyShapeOnly = filterPersonalColors(mockVendors, {
      ...EMPTY_PERSONAL_COLOR_FILTERS,
      serviceTags: ["body_shape"],
    });
    expect(bodyShapeOnly.matched.length).toBe(1);
    expect(bodyShapeOnly.matched[0].vendor.id).toBe("WD-002");

    const dressOnly = filterPersonalColors(mockVendors, {
      ...EMPTY_PERSONAL_COLOR_FILTERS,
      serviceTags: ["dress"],
    });
    expect(dressOnly.matched.length).toBe(1);
    expect(dressOnly.matched[0].vendor.id).toBe("WD-001");
  });

  it("filters by budget and categorizes contact-only into unknown", () => {
    const budget20Man = filterPersonalColors(mockVendors, {
      ...EMPTY_PERSONAL_COLOR_FILTERS,
      priceBudgetMax: 200000,
    });
    // WD-002 is 250,000 (> 200,000) -> excluded
    // WD-001 has no price -> goes to unknown ("가격 문의 대상")
    expect(budget20Man.matched.length).toBe(0);
    expect(budget20Man.unknown.length).toBe(1);
    expect(budget20Man.unknown[0].vendor.id).toBe("WD-001");

    const budget30Man = filterPersonalColors(mockVendors, {
      ...EMPTY_PERSONAL_COLOR_FILTERS,
      priceBudgetMax: 300000,
    });
    expect(budget30Man.matched.length).toBe(1);
    expect(budget30Man.matched[0].vendor.id).toBe("WD-002");
    expect(budget30Man.unknown.length).toBe(1);
  });

  it("filters by grade A only", () => {
    const gradeAOnly = filterPersonalColors(mockVendors, {
      ...EMPTY_PERSONAL_COLOR_FILTERS,
      gradeAOnly: true,
    });
    expect(gradeAOnly.matched.length).toBe(1);
    expect(gradeAOnly.matched[0].vendor.id).toBe("WD-002");
  });

  it("filters vendors within map bounding box", () => {
    const bounds = {
      southWest: { latitude: 37.5, longitude: 127.0 },
      northEast: { latitude: 37.6, longitude: 127.1 },
    };
    const within = personalColorsWithinBounds(mockVendors, bounds);
    expect(within.map((v) => v.id)).toEqual(["WD-001", "WD-002"]);
  });
});
