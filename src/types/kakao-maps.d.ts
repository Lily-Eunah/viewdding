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
}

interface KakaoMarkerClustererInstance {
  clear(): void;
}

interface KakaoCustomOverlayInstance {
  setMap(map: KakaoMapInstance | null): void;
}

interface KakaoMapsNamespace {
  load(callback: () => void): void;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance;
  Marker: new (options: { position: KakaoLatLng; title: string; clickable: boolean }) => KakaoMarkerInstance;
  MarkerClusterer: new (options: {
    map: KakaoMapInstance;
    markers: KakaoMarkerInstance[];
    averageCenter: boolean;
    minLevel: number;
  }) => KakaoMarkerClustererInstance;
  CustomOverlay: new (options: {
    map: KakaoMapInstance;
    position: KakaoLatLng;
    content: HTMLElement;
    yAnchor: number;
    zIndex: number;
  }) => KakaoCustomOverlayInstance;
  event: {
    addListener(target: object, type: string, listener: () => void): void;
    removeListener(target: object, type: string, listener: () => void): void;
  };
}

interface Window {
  kakao?: { maps: KakaoMapsNamespace };
}
