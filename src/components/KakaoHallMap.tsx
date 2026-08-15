"use client";

import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hallMapVenuesWithinBounds } from "@/domain/hall-map";
import type { HallMapVenue } from "@/domain/hall-map";
import {
  applyHallMarkerSelection,
  createHallMarkerImages,
  createMarkerLabelHtml,
  type HallMarkerImages,
} from "./kakao-marker-style";
import { HallMapCard } from "./HallMapCard";

interface MarkerEntry {
  marker: KakaoMarkerInstance;
}

export function KakaoHallMap({ venues, appKey }: { venues: HallMapVenue[]; appKey: string }) {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null);
  const markerEntriesRef = useRef(new Map<string, MarkerEntry>());
  const markerImagesRef = useRef<HallMarkerImages | null>(null);
  const clustererRef = useRef<KakaoMarkerClustererInstance | null>(null);
  const overlayRef = useRef<KakaoCustomOverlayInstance | null>(null);

  const [sdkReady, setSdkReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listExpanded, setListExpanded] = useState(false);

  const mappableVenues = useMemo(
    () => venues.filter((venue) => venue.latitude !== null && venue.longitude !== null),
    [venues],
  );
  const selectedVenue = mappableVenues.find((venue) => venue.venueId === selectedId) ?? null;
  const visibleVenues = mappableVenues.filter((venue) => visibleIds.includes(venue.venueId));

  const loadMapSdk = useCallback(() => {
    const maps = window.kakao?.maps;
    if (!maps) return;
    maps.load(() => setSdkReady(true));
  }, []);

  useEffect(() => {
    if (!sdkReady || !mapNodeRef.current || !window.kakao || mappableVenues.length === 0) return;
    const maps = window.kakao.maps;
    const first = mappableVenues[0];
    const firstPosition = new maps.LatLng(first.latitude!, first.longitude!);
    const map = mapInstanceRef.current ?? new maps.Map(mapNodeRef.current, { center: firstPosition, level: 6 });
    mapInstanceRef.current = map;
    map.relayout();

    clustererRef.current?.clear();
    for (const entry of markerEntriesRef.current.values()) entry.marker.setMap(null);
    markerEntriesRef.current.clear();

    const bounds = new maps.LatLngBounds();
    const markerImages = createHallMarkerImages(maps);
    markerImagesRef.current = markerImages;
    const markers = mappableVenues.map((venue) => {
      const position = new maps.LatLng(venue.latitude!, venue.longitude!);
      const selected = venue.venueId === selectedId;
      const marker = new maps.Marker({
        position,
        title: venue.venueName,
        clickable: true,
        image: selected ? markerImages.selected : markerImages.normal,
      });
      marker.setZIndex(selected ? 10 : 0);
      maps.event.addListener(marker, "click", () => {
        setSelectedId(venue.venueId);
        setListExpanded(false);
      });
      markerEntriesRef.current.set(venue.venueId, { marker });
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

    const updateVisibleVenues = () => {
      const visibleBounds = map.getBounds();
      const southWest = visibleBounds.getSouthWest();
      const northEast = visibleBounds.getNorthEast();
      const visible = hallMapVenuesWithinBounds(mappableVenues, {
        south: southWest.getLat(),
        west: southWest.getLng(),
        north: northEast.getLat(),
        east: northEast.getLng(),
      });
      const nextIds = visible.map((venue) => venue.venueId);
      setVisibleIds(nextIds);
      setSelectedId((current) => (current && nextIds.includes(current) ? current : null));
    };

    setVisibleIds(mappableVenues.map((venue) => venue.venueId));
    setSelectedId((current) => (mappableVenues.some((venue) => venue.venueId === current) ? current : null));
    maps.event.addListener(map, "idle", updateVisibleVenues);
    updateVisibleVenues();
    return () => maps.event.removeListener(map, "idle", updateVisibleVenues);
  }, [mappableVenues, sdkReady]);

  // Marker image & CustomOverlay updating
  useEffect(() => {
    if (markerImagesRef.current) {
      applyHallMarkerSelection(markerEntriesRef.current, selectedId, markerImagesRef.current);
    }

    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }

    if (selectedVenue && selectedVenue.latitude && selectedVenue.longitude && window.kakao?.maps && mapInstanceRef.current) {
      const maps = window.kakao.maps;
      const position = new maps.LatLng(selectedVenue.latitude, selectedVenue.longitude);
      const content = createMarkerLabelHtml(selectedVenue.venueName);
      const overlay = new maps.CustomOverlay({
        position,
        content,
        yAnchor: 2.2,
        zIndex: 11,
      });
      overlay.setMap(mapInstanceRef.current);
      overlayRef.current = overlay;
    }
  }, [selectedId, selectedVenue]);

  function selectVenue(venue: HallMapVenue) {
    setSelectedId(venue.venueId);
    setListExpanded(false);
    if (mapInstanceRef.current && venue.latitude && venue.longitude && window.kakao?.maps) {
      mapInstanceRef.current.panTo(new window.kakao.maps.LatLng(venue.latitude, venue.longitude));
    }
  }

  const missingCoordinateCount = venues.length - mappableVenues.length;
  const mapUnavailable = !appKey || scriptError;

  return (
    <section className="restaurant-map-shell hall-map-shell" aria-label="웨딩홀 지도 결과">
      <div className="restaurant-map-stage">
        <div className="restaurant-map-status">
          <strong>지도에 표시 {mappableVenues.length}곳</strong>
          {missingCoordinateCount > 0 ? <span>위치 확인 필요 {missingCoordinateCount}곳</span> : null}
        </div>
        {mapUnavailable ? (
          <div className="restaurant-map-placeholder">
            <p className="eyebrow">KAKAO MAP</p>
            <h3>지도를 연결할 수 없어요.</h3>
            <p>잠시 후 다시 시도하거나 목록에서 웨딩홀을 확인해주세요.</p>
          </div>
        ) : mappableVenues.length === 0 ? (
          <div className="restaurant-map-placeholder">
            <p className="eyebrow">ADDRESS CHECK</p>
            <h3>지도에 표시할 웨딩홀이 없어요.</h3>
            <p>필터를 줄이거나 목록 보기에서 전체 결과를 확인해주세요.</p>
          </div>
        ) : (
          <div ref={mapNodeRef} className="restaurant-map-canvas" aria-label="카카오맵" />
        )}

        {selectedVenue ? (
          <HallMapCard
            venue={selectedVenue}
            onClose={() => setSelectedId(null)}
          />
        ) : null}

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

      <aside className={`restaurant-map-sidebar${listExpanded ? " is-expanded" : ""}`} aria-label="지도 웨딩홀 목록">
        <button className="map-sheet-handle" type="button" aria-expanded={listExpanded} onClick={() => setListExpanded((expanded) => !expanded)}>
          <span aria-hidden="true" />
          <strong>현재 지도 {visibleVenues.length}곳</strong>
          <small>{listExpanded ? "지도 보기" : "목록 보기"}</small>
        </button>

        <div className="map-place-list">
          {visibleVenues.map((venue) => (
            <button key={venue.venueId} type="button" className={venue.venueId === selectedVenue?.venueId ? "is-selected" : ""} aria-pressed={venue.venueId === selectedVenue?.venueId} onClick={() => selectVenue(venue)}>
              <strong>{venue.venueName}</strong>
              <span>{venue.district} · 개별홀 {venue.halls.length}개</span>
            </button>
          ))}
          {visibleVenues.length === 0 ? <p className="map-empty-list">현재 지도 영역에 웨딩홀이 없습니다.</p> : null}
        </div>
      </aside>
    </section>
  );
}
