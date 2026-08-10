"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hallCapacitySummary, hallMapVenuesWithinBounds } from "@/domain/hall-map";
import type { HallMapBounds, HallMapVenue } from "@/domain/hall-map";
import { hallTags } from "@/lib/labels";
import { FavoriteButton } from "./FavoriteButton";
import {
  applyHallMarkerSelection,
  createHallMarkerImages,
  type HallMarkerImages,
} from "./kakao-marker-style";

interface MarkerEntry {
  marker: KakaoMarkerInstance;
}

export function KakaoHallMap({
  venues,
  appKey,
  filterKey,
  onBoundsChange,
}: {
  venues: HallMapVenue[];
  appKey: string;
  filterKey: string;
  onBoundsChange: (bounds: HallMapBounds) => void;
}) {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null);
  const markerEntriesRef = useRef(new Map<string, MarkerEntry>());
  const markerImagesRef = useRef<HallMarkerImages | null>(null);
  const clustererRef = useRef<KakaoMarkerClustererInstance | null>(null);
  const fittedFilterKeyRef = useRef<string | null>(null);
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
    if (!sdkReady || !mapNodeRef.current || !window.kakao) return;
    const maps = window.kakao.maps;
    const first = mappableVenues[0];
    const firstPosition = first ? new maps.LatLng(first.latitude!, first.longitude!) : new maps.LatLng(36.3, 127.8);
    const map = mapInstanceRef.current ?? new maps.Map(mapNodeRef.current, { center: firstPosition, level: first ? 6 : 13 });
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

    if (markers.length === 1 && fittedFilterKeyRef.current !== filterKey) {
      markers[0].setMap(map);
      map.setCenter(firstPosition);
      map.setLevel(4);
      fittedFilterKeyRef.current = filterKey;
    } else if (markers.length > 0) {
      clustererRef.current = new maps.MarkerClusterer({ map, markers, averageCenter: true, minLevel: 6 });
      if (fittedFilterKeyRef.current !== filterKey) {
        map.setBounds(bounds);
        fittedFilterKeyRef.current = filterKey;
      }
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
      setSelectedId((current) => current && nextIds.includes(current) ? current : null);
      onBoundsChange({
        south: southWest.getLat(),
        west: southWest.getLng(),
        north: northEast.getLat(),
        east: northEast.getLng(),
      });
    };

    setVisibleIds(mappableVenues.map((venue) => venue.venueId));
    setSelectedId((current) => mappableVenues.some((venue) => venue.venueId === current) ? current : null);
    maps.event.addListener(map, "idle", updateVisibleVenues);
    return () => maps.event.removeListener(map, "idle", updateVisibleVenues);
  }, [filterKey, mappableVenues, onBoundsChange, sdkReady]);

  useEffect(() => {
    if (!markerImagesRef.current) return;
    applyHallMarkerSelection(markerEntriesRef.current, selectedId, markerImagesRef.current);
  }, [selectedId]);

  function selectVenue(venue: HallMapVenue) {
    setSelectedId(venue.venueId);
    setListExpanded(false);
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

      <aside className={`restaurant-map-sidebar${listExpanded ? " is-expanded" : ""}`} aria-label="지도 웨딩홀 목록">
        <button className="map-sheet-handle" type="button" aria-expanded={listExpanded} onClick={() => setListExpanded((expanded) => !expanded)}>
          <span aria-hidden="true" />
          <strong>현재 지도 {visibleVenues.length}곳</strong>
          <small>{listExpanded ? "지도 보기" : "목록 보기"}</small>
        </button>
        {selectedVenue ? (
          <div className="map-selected-place hall-map-selected-place">
            <p className="eyebrow">선택한 예식장</p>
            <h3>{selectedVenue.venueName}</h3>
            <p>{selectedVenue.district}{selectedVenue.address ? ` · ${selectedVenue.address}` : ""}</p>
            <div className="map-selected-halls">
              {selectedVenue.halls.map(({ hall, unknownReasons }) => (
                <article className="map-selected-hall" key={hall.id}>
                  <div className="map-selected-hall-heading">
                    <div><strong><Link href={`/halls/${hall.id}/`}>{hall.hallName}</Link></strong><span>{hallCapacitySummary(hall) ?? "수용 인원 문의"}</span></div>
                    <FavoriteButton hallId={hall.id} compact />
                  </div>
                  <div className="map-selected-chips">{hallTags(hall).slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
                  {unknownReasons.length > 0 ? <small>일부 조건 확인 필요</small> : null}
                </article>
              ))}
            </div>
            <div className="map-selected-links">
              {selectedVenue.placeUrl ? <a href={selectedVenue.placeUrl} target="_blank" rel="noreferrer">카카오맵</a> : null}
            </div>
          </div>
        ) : null}
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
