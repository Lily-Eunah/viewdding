"use client";

import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RestaurantRecord } from "@/domain/restaurant-types";

interface MarkerEntry {
  marker: KakaoMarkerInstance;
  position: KakaoLatLng;
}

function restaurantName(restaurant: RestaurantRecord): string {
  return `${restaurant.name}${restaurant.branch ? ` ${restaurant.branch}` : ""}`;
}

export function KakaoRestaurantMap({
  restaurants,
  appKey,
}: {
  restaurants: RestaurantRecord[];
  appKey: string;
}) {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null);
  const markerEntriesRef = useRef(new Map<string, MarkerEntry>());
  const clustererRef = useRef<KakaoMarkerClustererInstance | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const mappableRestaurants = useMemo(
    () => restaurants.filter((restaurant) => restaurant.latitude !== null && restaurant.longitude !== null),
    [restaurants],
  );
  const [selectedId, setSelectedId] = useState<string | null>(mappableRestaurants[0]?.id ?? null);
  const selectedRestaurant = mappableRestaurants.find((restaurant) => restaurant.id === selectedId)
    ?? mappableRestaurants[0]
    ?? null;

  const loadMapSdk = useCallback(() => {
    const maps = window.kakao?.maps;
    if (!maps) return;
    maps.load(() => setSdkReady(true));
  }, []);

  useEffect(() => {
    if (!sdkReady || !mapNodeRef.current || !window.kakao || mappableRestaurants.length === 0) return;
    const maps = window.kakao.maps;
    const first = mappableRestaurants[0];
    const firstPosition = new maps.LatLng(first.latitude!, first.longitude!);
    const map = mapInstanceRef.current ?? new maps.Map(mapNodeRef.current, { center: firstPosition, level: 6 });
    mapInstanceRef.current = map;
    map.relayout();

    clustererRef.current?.clear();
    for (const entry of markerEntriesRef.current.values()) entry.marker.setMap(null);
    markerEntriesRef.current.clear();

    const bounds = new maps.LatLngBounds();
    const markers = mappableRestaurants.map((restaurant) => {
      const position = new maps.LatLng(restaurant.latitude!, restaurant.longitude!);
      const marker = new maps.Marker({ position, title: restaurantName(restaurant), clickable: true });
      maps.event.addListener(marker, "click", () => setSelectedId(restaurant.id));
      markerEntriesRef.current.set(restaurant.id, { marker, position });
      bounds.extend(position);
      return marker;
    });

    if (markers.length === 1) {
      markers[0].setMap(map);
      map.setCenter(firstPosition);
      map.setLevel(4);
    } else {
      clustererRef.current = new maps.MarkerClusterer({ map, markers, averageCenter: true, minLevel: 6 });
      map.setBounds(bounds);
    }

    setSelectedId((current) => mappableRestaurants.some((restaurant) => restaurant.id === current)
      ? current
      : first.id);
  }, [mappableRestaurants, sdkReady]);

  function focusRestaurant(restaurant: RestaurantRecord) {
    setSelectedId(restaurant.id);
    const entry = markerEntriesRef.current.get(restaurant.id);
    const map = mapInstanceRef.current;
    if (entry && map) {
      map.panTo(entry.position);
      map.setLevel(4);
    }
  }

  const missingCoordinateCount = restaurants.length - mappableRestaurants.length;
  const mapUnavailable = !appKey || scriptError;

  return (
    <section className="restaurant-map-shell" aria-label="음식점 지도 결과">
      <div className="restaurant-map-stage">
        <div className="restaurant-map-status">
          <strong>지도에 표시 {mappableRestaurants.length}곳</strong>
          {missingCoordinateCount > 0 ? <span>좌표 확인 필요 {missingCoordinateCount}곳</span> : null}
        </div>
        {mapUnavailable ? (
          <div className="restaurant-map-placeholder">
            <p className="eyebrow">KAKAO MAP</p>
            <h3>지도 연결을 준비하고 있어요</h3>
            <p>카카오맵 키가 연결되면 필터 결과가 이곳에 마커로 표시됩니다.</p>
          </div>
        ) : mappableRestaurants.length === 0 ? (
          <div className="restaurant-map-placeholder">
            <p className="eyebrow">ADDRESS CHECK</p>
            <h3>표시할 좌표를 준비하고 있어요</h3>
            <p>주소 좌표 변환이 끝난 음식점부터 지도에 표시됩니다.</p>
          </div>
        ) : (
          <div ref={mapNodeRef} className="restaurant-map-canvas" aria-label="카카오맵" />
        )}
        {appKey ? (
          <Script
            id="kakao-maps-sdk"
            src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=clusterer`}
            strategy="afterInteractive"
            onLoad={loadMapSdk}
            onReady={loadMapSdk}
            onError={() => setScriptError(true)}
          />
        ) : null}
      </div>

      <aside className="restaurant-map-sidebar" aria-label="지도 음식점 목록">
        {selectedRestaurant ? (
          <div className="map-selected-place">
            <p className="eyebrow">선택한 장소</p>
            <h3>{restaurantName(selectedRestaurant)}</h3>
            <p>{selectedRestaurant.address ?? selectedRestaurant.area ?? selectedRestaurant.district}</p>
            {selectedRestaurant.kakaoMapUrl ? <a href={selectedRestaurant.kakaoMapUrl} target="_blank" rel="noreferrer">카카오맵 상세 보기 →</a> : null}
          </div>
        ) : null}
        <div className="map-place-list">
          {mappableRestaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              type="button"
              className={restaurant.id === selectedRestaurant?.id ? "is-selected" : ""}
              aria-pressed={restaurant.id === selectedRestaurant?.id}
              onClick={() => focusRestaurant(restaurant)}
            >
              <strong>{restaurantName(restaurant)}</strong>
              <span>{restaurant.area ?? restaurant.district}{restaurant.nearestStation ? ` · ${restaurant.nearestStation}` : ""}</span>
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}
