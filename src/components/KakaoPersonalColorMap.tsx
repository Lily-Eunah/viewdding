"use client";

import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { personalColorsWithinBounds } from "@/domain/personal-color-map";
import type { PersonalColorRecord } from "@/domain/personal-color-types";
import {
  createMarkerLabelHtml,
  createPersonalColorMarkerImages,
  type PersonalColorMarkerImages,
} from "./kakao-marker-style";
import { PersonalColorMapCard } from "./PersonalColorMapCard";
import { formatPersonalColorPrice } from "@/lib/personal-colors";

interface MarkerEntry {
  marker: KakaoMarkerInstance;
}

export function KakaoPersonalColorMap({
  vendors,
  appKey,
}: {
  vendors: PersonalColorRecord[];
  appKey: string;
}) {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null);
  const markerEntriesRef = useRef<Map<string, MarkerEntry>>(new Map());
  const markerImagesRef = useRef<PersonalColorMarkerImages | null>(null);
  const clustererRef = useRef<KakaoMarkerClustererInstance | null>(null);
  const overlayRef = useRef<KakaoCustomOverlayInstance | null>(null);

  const [sdkReady, setSdkReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const mappableVendors = useMemo(
    () => vendors.filter((v) => v.latitude !== null && v.longitude !== null),
    [vendors]
  );
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listExpanded, setListExpanded] = useState(false);

  const selectedVendor = mappableVendors.find((v) => v.id === selectedId) ?? null;
  const visibleVendors = mappableVendors.filter((v) => visibleIds.includes(v.id));

  const loadMapSdk = useCallback(() => {
    const maps = window.kakao?.maps;
    if (!maps) return;
    maps.load(() => setSdkReady(true));
  }, []);

  useEffect(() => {
    if (!sdkReady || !mapNodeRef.current || !window.kakao || mappableVendors.length === 0) return;
    const maps = window.kakao.maps;
    const first = mappableVendors[0];
    const firstPosition = new maps.LatLng(first.latitude!, first.longitude!);
    const map = mapInstanceRef.current ?? new maps.Map(mapNodeRef.current, { center: firstPosition, level: 6 });
    mapInstanceRef.current = map;
    map.relayout();

    clustererRef.current?.clear();
    for (const entry of markerEntriesRef.current.values()) entry.marker.setMap(null);
    markerEntriesRef.current.clear();

    const bounds = new maps.LatLngBounds();
    const markerImages = createPersonalColorMarkerImages(maps);
    markerImagesRef.current = markerImages;

    const markers = mappableVendors.map((vendor) => {
      const position = new maps.LatLng(vendor.latitude!, vendor.longitude!);
      const selected = vendor.id === selectedId;
      const marker = new maps.Marker({
        position,
        title: vendor.name,
        clickable: true,
        image: selected ? markerImages.selected : markerImages.normal,
      });
      marker.setZIndex(selected ? 10 : 0);
      maps.event.addListener(marker, "click", () => {
        setSelectedId(vendor.id);
        setListExpanded(false);
      });
      markerEntriesRef.current.set(vendor.id, { marker });
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

    const updateVisibleVendors = () => {
      const currentBounds = map.getBounds();
      const sw = currentBounds.getSouthWest();
      const ne = currentBounds.getNorthEast();
      const matched = personalColorsWithinBounds(mappableVendors, {
        southWest: { latitude: sw.getLat(), longitude: sw.getLng() },
        northEast: { latitude: ne.getLat(), longitude: ne.getLng() },
      });
      setVisibleIds(matched.map((v) => v.id));
    };

    updateVisibleVendors();
    maps.event.addListener(map, "idle", updateVisibleVendors);

    return () => {
      maps.event.removeListener(map, "idle", updateVisibleVendors);
    };
  }, [mappableVendors, sdkReady]);

  // Marker selection effect
  useEffect(() => {
    const maps = window.kakao?.maps;
    const images = markerImagesRef.current;
    if (!maps || !images) return;

    for (const [vendorId, entry] of markerEntriesRef.current.entries()) {
      const selected = vendorId === selectedId;
      entry.marker.setImage(selected ? images.selected : images.normal);
      entry.marker.setZIndex(selected ? 10 : 0);
    }

    overlayRef.current?.setMap(null);
    if (!selectedVendor || selectedVendor.latitude === null || selectedVendor.longitude === null) return;

    const overlay = new maps.CustomOverlay({
      position: new maps.LatLng(selectedVendor.latitude, selectedVendor.longitude),
      content: createMarkerLabelHtml(selectedVendor.name),
      yAnchor: 1.85,
    });
    overlay.setMap(mapInstanceRef.current);
    overlayRef.current = overlay;
  }, [selectedId, selectedVendor]);

  const selectVendor = (id: string) => {
    setSelectedId(id);
    const target = mappableVendors.find((v) => v.id === id);
    if (!target || !mapInstanceRef.current || !window.kakao?.maps || target.latitude === null || target.longitude === null) return;
    const maps = window.kakao.maps;
    const pos = new maps.LatLng(target.latitude, target.longitude);
    mapInstanceRef.current.panTo(pos);
  };

  return (
    <div className="kakao-hall-map-container" style={{ position: "relative", width: "100%", height: "100%" }}>
      {appKey ? (
        <Script
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=clusterer,services&autoload=false`}
          strategy="afterInteractive"
          onLoad={loadMapSdk}
          onError={() => setScriptError(true)}
        />
      ) : null}

      <div ref={mapNodeRef} className="kakao-hall-map" aria-label="웨딩 퍼스널 컬러 지도" />

      {/* Script Loading / Error fallback */}
      {!sdkReady && !scriptError ? (
        <div className="kakao-map-state-overlay">
          <p>지도를 불러오는 중입니다...</p>
        </div>
      ) : null}

      {scriptError || !appKey ? (
        <div className="kakao-map-state-overlay error">
          <p>지도 로드에 실패했습니다. 리스트 뷰를 이용해 주세요.</p>
        </div>
      ) : null}

      {/* Selected Vendor Preview Card */}
      {selectedVendor ? (
        <div className="map-bottom-card-container">
          <PersonalColorMapCard vendor={selectedVendor} onClose={() => setSelectedId(null)} />
        </div>
      ) : null}

      {/* Floating Viewport Counter / Drawer Trigger */}
      <div className="map-floating-panel">
        <button
          type="button"
          className="map-floating-list-btn"
          onClick={() => setListExpanded(!listExpanded)}
        >
          <span>현재 영역 업체 ({visibleVendors.length})</span>
        </button>
      </div>

      {/* Expanded List Drawer */}
      {listExpanded ? (
        <div className="map-drawer-backdrop" onClick={() => setListExpanded(false)}>
          <div className="map-drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <header className="map-drawer-header">
              <h3>지도 영역 내 업체 ({visibleVendors.length})</h3>
              <button type="button" onClick={() => setListExpanded(false)}>
                닫기
              </button>
            </header>
            <div className="map-drawer-list">
              {visibleVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className={`map-drawer-item ${vendor.id === selectedId ? "is-selected" : ""}`}
                  onClick={() => {
                    selectVendor(vendor.id);
                    setListExpanded(false);
                  }}
                >
                  <div>
                    <h4>{vendor.name}</h4>
                    <p>{vendor.district} · {vendor.evidence || "웨딩컨설팅"}</p>
                  </div>
                  <span className="drawer-price">{formatPersonalColorPrice(vendor)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
