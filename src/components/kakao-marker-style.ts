export const RESTAURANT_MARKER_VISUALS = {
  normal: { width: 30, height: 40, color: "#6f6862" },
  selected: { width: 36, height: 48, color: "#8d4f45" },
} as const;

export interface RestaurantMarkerImages {
  normal: KakaoMarkerImageInstance;
  selected: KakaoMarkerImageInstance;
}

function createPinDataUrl({ width, height, color }: (typeof RESTAURANT_MARKER_VISUALS)[keyof typeof RESTAURANT_MARKER_VISUALS]): string {
  const renderScale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * renderScale;
  canvas.height = height * renderScale;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create restaurant marker image.");

  context.scale(renderScale, renderScale);
  const centerX = width / 2;

  context.save();
  context.shadowColor = "rgba(56, 38, 33, 0.24)";
  context.shadowBlur = width === RESTAURANT_MARKER_VISUALS.selected.width ? 5 : 3;
  context.shadowOffsetY = 2;
  context.beginPath();
  context.moveTo(centerX, height - 1);
  context.bezierCurveTo(centerX - 2, height - 7, 3, height * 0.62, 3, height * 0.4);
  context.bezierCurveTo(3, 8, 8, 3, centerX, 3);
  context.bezierCurveTo(width - 8, 3, width - 3, 8, width - 3, height * 0.4);
  context.bezierCurveTo(width - 3, height * 0.62, centerX + 2, height - 7, centerX, height - 1);
  context.closePath();
  context.fillStyle = color;
  context.fill();
  context.restore();

  context.beginPath();
  context.arc(centerX, height * 0.38, width * 0.18, 0, Math.PI * 2);
  context.fillStyle = "#fffaf4";
  context.fill();

  return canvas.toDataURL("image/png");
}

export function createRestaurantMarkerImages(maps: KakaoMapsNamespace): RestaurantMarkerImages {
  const createImage = (visual: (typeof RESTAURANT_MARKER_VISUALS)[keyof typeof RESTAURANT_MARKER_VISUALS], alt: string) => (
    new maps.MarkerImage(
      createPinDataUrl(visual),
      new maps.Size(visual.width, visual.height),
      {
        offset: new maps.Point(visual.width / 2, visual.height),
        alt,
      },
    )
  );

  return {
    normal: createImage(RESTAURANT_MARKER_VISUALS.normal, "음식점 위치"),
    selected: createImage(RESTAURANT_MARKER_VISUALS.selected, "선택한 음식점 위치"),
  };
}

export function applyRestaurantMarkerSelection(
  entries: Iterable<[string, { marker: KakaoMarkerInstance }]>,
  selectedId: string | null,
  images: RestaurantMarkerImages,
): void {
  for (const [restaurantId, entry] of entries) {
    const selected = restaurantId === selectedId;
    entry.marker.setImage(selected ? images.selected : images.normal);
    entry.marker.setZIndex(selected ? 10 : 0);
  }
}
