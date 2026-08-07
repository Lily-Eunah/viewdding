import { describe, expect, it } from "vitest";
import {
  isVisitReviewEvidence,
  normalizeRestaurantEvidenceRow,
} from "../src/domain/restaurant-evidence";

const baseRow = {
  evidence_id: "E001",
  restaurant_id: "R001",
  purpose: "청모",
  source_type: "네이버 블로그",
  source_title: "청첩장 모임 후기",
  source_url: "https://blog.naver.com/example/1",
  sponsored: "FALSE",
  companion_type: "친구, 회사동료",
};

describe("restaurant evidence normalization", () => {
  it("normalizes a visit review and its join keys", () => {
    const evidence = normalizeRestaurantEvidenceRow(baseRow);

    expect(evidence).toMatchObject({
      id: "E001",
      restaurantSourceId: "R001",
      purpose: "invitation",
      sponsored: "no",
      companionTypes: ["친구", "회사동료"],
    });
    expect(evidence && isVisitReviewEvidence(evidence)).toBe(true);
  });

  it("keeps map search evidence out of visit reviews", () => {
    const evidence = normalizeRestaurantEvidenceRow({
      ...baseRow,
      source_type: "검색 결과",
      source_url: "https://map.kakao.com/?q=restaurant",
    });

    expect(evidence && isVisitReviewEvidence(evidence)).toBe(false);
  });

  it("includes review-only map evidence", () => {
    const evidence = normalizeRestaurantEvidenceRow({
      ...baseRow,
      source_type: "카카오맵 후기",
      source_url: "https://place.map.kakao.com/123",
    });

    expect(evidence && isVisitReviewEvidence(evidence)).toBe(true);
  });

  it("normalizes family meeting and unknown sponsorship", () => {
    const evidence = normalizeRestaurantEvidenceRow({
      ...baseRow,
      purpose: "상견례",
      sponsored: "확인필요",
    });

    expect(evidence).toMatchObject({ purpose: "family_meeting", sponsored: "unknown" });
  });

  it("keeps generic evidence available for every purpose of a restaurant", () => {
    const evidence = normalizeRestaurantEvidenceRow({
      ...baseRow,
      purpose: "방문추천",
    });

    expect(evidence).toMatchObject({ purpose: null, purposeLabel: "방문추천" });
  });

  it("maps purpose-specific review labels to their gathering purpose", () => {
    expect(normalizeRestaurantEvidenceRow({ ...baseRow, purpose: "청모후기" })?.purpose).toBe("invitation");
    expect(normalizeRestaurantEvidenceRow({ ...baseRow, purpose: "상견례후기" })?.purpose).toBe("family_meeting");
  });

  it("rejects rows without a valid web source", () => {
    expect(normalizeRestaurantEvidenceRow({ ...baseRow, source_url: "not-a-url" })).toBeNull();
  });
});
