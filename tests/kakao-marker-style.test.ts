import { describe, expect, it, vi } from "vitest";
import {
  applyRestaurantMarkerSelection,
  RESTAURANT_MARKER_VISUALS,
  type RestaurantMarkerImages,
} from "../src/components/kakao-marker-style";

function markerMock() {
  return {
    setImage: vi.fn(),
    setZIndex: vi.fn(),
  } as unknown as KakaoMarkerInstance;
}

describe("restaurant marker selection", () => {
  it("uses an exact 1.2x selected marker size", () => {
    expect(RESTAURANT_MARKER_VISUALS.selected.width / RESTAURANT_MARKER_VISUALS.normal.width).toBe(1.2);
    expect(RESTAURANT_MARKER_VISUALS.selected.height / RESTAURANT_MARKER_VISUALS.normal.height).toBe(1.2);
  });

  it("changes only the selected marker image and stacking order", () => {
    const first = markerMock();
    const second = markerMock();
    const images = {
      normal: { kind: "normal" },
      selected: { kind: "selected" },
    } as unknown as RestaurantMarkerImages;

    applyRestaurantMarkerSelection([
      ["first", { marker: first }],
      ["second", { marker: second }],
    ], "second", images);

    expect(first.setImage).toHaveBeenCalledWith(images.normal);
    expect(first.setZIndex).toHaveBeenCalledWith(0);
    expect(second.setImage).toHaveBeenCalledWith(images.selected);
    expect(second.setZIndex).toHaveBeenCalledWith(10);
  });
});
