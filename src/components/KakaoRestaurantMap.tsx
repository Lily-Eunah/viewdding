"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { restaurantsWithinBounds } from "@/domain/restaurant-map";
import type { RestaurantRecord } from "@/domain/restaurant-types";
import { restaurantSlug } from "@/lib/restaurant-routes";
import {
  applyRestaurantMarkerSelection,
  createRestaurantMarkerImages,
  type RestaurantMarkerImages,
} from "./kakao-marker-style";

interface MarkerEntry {
  marker: KakaoMarkerInstance;
}

function restaurantName(restaurant: RestaurantRecord): string {
  return `${restaurant.name}${restaurant.branch ? ` ${restaurant.branch}` : ""}`;
}

function priceSummary(restaurant: RestaurantRecord): string {
  const { min, max } = restaurant.pricePerPerson;
  if (min !== null && max !== null) return `${min.toLocaleString("ko-KR")}~${max.toLocaleString("ko-KR")}원`;
  if (min !== null) return `${min.toLocaleString("ko-KR")}원부터`;
  if (max !== null) return `${max.toLocaleString("ko-KR")}원까지`;
  return "가격 확인 필요";
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
  const markerImagesRef = useRef<RestaurantMarkerImages | null>(null);
  const clustererRef = useRef<KakaoMarkerClustererInstance | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const mappableRestaurants = useMemo(
    () => restaurants.filter((restaurant) => restaurant.latitude !== null && restaurant.longitude !== null),
    [restaurants],
  );
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listExpanded, setListExpanded] = useState(false);
  const selectedRestaurant = mappableRestaurants.find((restaurant) => restaurant.id === selectedId) ?? null;
  const visibleRestaurants = mappableRestaurants.filter((restaurant) => visibleIds.includes(restaurant.id));

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
    const markerImages = createRestaurantMarkerImages(maps);
    markerImagesRef.current = markerImages;
    const markers = mappableRestaurants.map((restaurant) => {
      const position = new maps.LatLng(restaurant.latitude!, restaurant.longitude!);
      const selected = restaurant.id === selectedId;
      const marker = new maps.Marker({
        position,
        title: restaurantName(restaurant),
        clickable: true,
        image: selected ? markerImages.selected : markerImages.normal,
      });
      marker.setZIndex(selected ? 10 : 0);
      maps.event.addListener(marker, "click", () => {
        setSelectedId(restaurant.id);
        setListExpanded(false);
      });
      markerEntriesRef.current.set(restaurant.id, { marker });
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

    const updateVisibleRestaurants = () => {
      const visibleBounds = map.getBounds();
      const southWest = visibleBounds.getSouthWest();
      const northEast = visibleBounds.getNorthEast();
      const visible = restaurantsWithinBounds(mappableRestaurants, {
        south: southWest.getLat(),
        west: southWest.getLng(),
        north: northEast.getLat(),
        east: northEast.getLng(),
      });
      const nextIds = visible.map((restaurant) => restaurant.id);
      setVisibleIds(nextIds);
      setSelectedId((current) => current && nextIds.includes(current) ? current : null);
    };

    setVisibleIds(mappableRestaurants.map((restaurant) => restaurant.id));
    setSelectedId((current) => mappableRestaurants.some((restaurant) => restaurant.id === current) ? current : null);
    maps.event.addListener(map, "idle", updateVisibleRestaurants);
    updateVisibleRestaurants();

    return () => maps.event.removeListener(map, "idle", updateVisibleRestaurants);
  }, [mappableRestaurants, sdkReady]);

  useEffect(() => {
    const markerImages = markerImagesRef.current;
    if (!markerImages) return;
    applyRestaurantMarkerSelection(markerEntriesRef.current, selectedId, markerImages);
  }, [selectedId]);

  function selectRestaurant(restaurant: RestaurantRecord) {
    setSelectedId(restaurant.id);
    setListExpanded(false);
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

      <aside className={`restaurant-map-sidebar${listExpanded ? " is-expanded" : ""}`} aria-label="지도 음식점 목록">
        <button
          className="map-sheet-handle"
          type="button"
          aria-expanded={listExpanded}
          onClick={() => setListExpanded((expanded) => !expanded)}
        >
          <span aria-hidden="true" />
          <strong>현재 지도 {visibleRestaurants.length}곳</strong>
          <small>{listExpanded ? "지도 보기" : "목록 보기"}</small>
        </button>
        {selectedRestaurant ? (
          <div className="map-selected-place">
            <p className="eyebrow">선택한 장소</p>
            <h3>{restaurantName(selectedRestaurant)}</h3>
            <p>{selectedRestaurant.area ?? selectedRestaurant.district}{selectedRestaurant.nearestStation ? ` · ${selectedRestaurant.nearestStation}` : ""} · {priceSummary(selectedRestaurant)}</p>
            <div className="map-selected-chips">
              {selectedRestaurant.venueType ? <span>업종 · {selectedRestaurant.venueType}</span> : null}
              {selectedRestaurant.cuisines.slice(0, 2).map((cuisine) => <span key={cuisine}>{cuisine}</span>)}
            </div>
            <div className="map-selected-links">
              <Link href={`/restaurants/${restaurantSlug(selectedRestaurant)}/`}>상세보기</Link>
              {selectedRestaurant.naverMapUrl ? <a href={selectedRestaurant.naverMapUrl} target="_blank" rel="noreferrer">네이버 지도</a> : null}
              {selectedRestaurant.kakaoMapUrl ? <a href={selectedRestaurant.kakaoMapUrl} target="_blank" rel="noreferrer">카카오맵</a> : null}
            </div>
          </div>
        ) : null}
        <div className="map-place-list">
          {visibleRestaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              type="button"
              className={restaurant.id === selectedRestaurant?.id ? "is-selected" : ""}
              aria-pressed={restaurant.id === selectedRestaurant?.id}
              onClick={() => selectRestaurant(restaurant)}
            >
              <strong>{restaurantName(restaurant)}</strong>
              <span>{restaurant.area ?? restaurant.district}{restaurant.nearestStation ? ` · ${restaurant.nearestStation}` : ""}</span>
            </button>
          ))}
          {visibleRestaurants.length === 0 ? <p className="map-empty-list">현재 지도 영역에 음식점이 없습니다.</p> : null}
        </div>
      </aside>
    </section>
  );
}
