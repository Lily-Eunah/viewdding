import { describe, expect, it } from "vitest";
import {
  normalizeCeremonyFormat,
  normalizeLighting,
  normalizeMeals,
  parseNumericRange,
} from "../src/domain/normalization";

describe("normalization", () => {
  it("maps transitional lighting independently", () => {
    expect(normalizeLighting("전환형")).toBe("transitional");
  });

  it("parses numeric ranges", () => {
    expect(parseNumericRange("70~90")).toMatchObject({ min: 70, max: 90 });
    expect(parseNumericRange(180)).toMatchObject({ min: 180, max: 180 });
  });

  it("uses meal text only as a fallback for ceremony format", () => {
    expect(normalizeCeremonyFormat(null, "뷔페/분리")).toBe("separate");
    expect(normalizeCeremonyFormat("동시예식", "뷔페/분리")).toBe("simultaneous");
  });

  it("keeps composite meals as multiple normalized values", () => {
    expect(normalizeMeals("한식·뷔페/분리", "separate")).toEqual(expect.arrayContaining(["buffet", "korean"]));
  });
});
