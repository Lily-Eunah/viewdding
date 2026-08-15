import { describe, expect, it } from "vitest";
import audit from "../src/data/map-candidate-audit.generated.json";

describe("map candidate audit", () => {
  it("covers every current target administrative unit on both map channels", () => {
    expect(audit.coverage.currentAdminUnitCount).toBe(91);
    expect(audit.coverage.legacyIncheonUnitCount).toBe(3);
    expect(audit.coverage.searchLogCount).toBe(188);
    expect(new Set(audit.queries.map((query) => query.channel))).toEqual(
      new Set(["카카오맵", "네이버지도"]),
    );
  });

  it("includes the reorganized Incheon districts while retaining legacy searches for discovery", () => {
    const incheonUnits = new Set(
      audit.queries
        .filter((query) => query.sido === "인천광역시")
        .map((query) => query.unit),
    );

    for (const unit of ["제물포구", "영종구", "서해구", "검단구"]) {
      expect(incheonUnits.has(unit)).toBe(true);
    }
    for (const legacyUnit of ["구주소:중구", "구주소:동구", "구주소:서구"]) {
      expect(incheonUnits.has(legacyUnit)).toBe(true);
    }
  });

  it("publishes only cross-channel candidates that passed all three verification gates", () => {
    expect(audit.candidates.length).toBe(audit.stats.total);

    const publicCandidates = audit.candidates.filter((candidate) => candidate.publicEligible);
    expect(publicCandidates).toHaveLength(audit.crossChannelVerification.stats.publicEligible);
    expect(publicCandidates).toHaveLength(32);
    expect(
      publicCandidates.every(
        (candidate) =>
          candidate.verificationStatus === "운영확인" &&
          candidate.officialInfoStatus === "확보" &&
          candidate.hallStructureStatus !== "미확인",
      ),
    ).toBe(true);
    expect(
      publicCandidates.every(
        (candidate) =>
          Boolean(candidate.verifiedOfficialUrl) && (candidate.verifiedHalls?.length || 0) > 0,
      ),
    ).toBe(true);

    const newCandidates = audit.candidates.filter((candidate) => candidate.decision === "신규 후보");
    expect(newCandidates).toHaveLength(audit.stats.byDecision["신규 후보"]);
    expect(
      newCandidates
        .filter((candidate) => !candidate.publicEligible)
        .every((candidate) => candidate.reviewStatus === "운영·홀 구조 확인 필요"),
    ).toBe(true);
  });
});
