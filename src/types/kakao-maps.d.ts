interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoLatLngBounds {
  extend(position: KakaoLatLng): void;
  getNorthEast(): KakaoLatLng;
  getSouthWest(): KakaoLatLng;
}

interface KakaoMapInstance {
  getBounds(): KakaoLatLngBounds;
  panTo(position: KakaoLatLng): void;
  relayout(): void;
  setBounds(bounds: KakaoLatLngBounds): void;
  setCenter(position: KakaoLatLng): void;
  setLevel(level: number): void;
}

interface KakaoMarkerInstance {
  setMap(map: KakaoMapInstance | null): void;
  setImage(image: KakaoMarkerImageInstance): void;
  setZIndex(zIndex: number): void;
}

interface KakaoMarkerClustererInstance {
  clear(): void;
}

interface KakaoCustomOverlayInstance {
  setMap(map: KakaoMapInstance | null): void;
}

interface KakaoSize {}

interface KakaoPoint {}

interface KakaoMarkerImageInstance {}

interface KakaoMapsNamespace {
  load(callback: () => void): void;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  Size: new (width: number, height: number) => KakaoSize;
  Point: new (x: number, y: number) => KakaoPoint;
  MarkerImage: new (
    source: string,
    size: KakaoSize,
    options?: { offset?: KakaoPoint; alt?: string },
  ) => KakaoMarkerImageInstance;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance;
  Marker: new (options: {
    position: KakaoLatLng;
    title: string;
    clickable: boolean;
    image?: KakaoMarkerImageInstance;
  }) => KakaoMarkerInstance;
  CustomOverlay: new (options: {
    position: KakaoLatLng;
    content: string | HTMLElement;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
  }) => KakaoCustomOverlayInstance;
  MarkerClusterer: new (options: {
    map: KakaoMapInstance;
    markers: KakaoMarkerInstance[];
    averageCenter: boolean;
    minLevel: number;
  }) => KakaoMarkerClustererInstance;
  event: {
    addListener(target: object, type: string, listener: () => void): void;
    removeListener(target: object, type: string, listener: () => void): void;
  };
}

interface Window {
  kakao?: { maps: KakaoMapsNamespace };
}
