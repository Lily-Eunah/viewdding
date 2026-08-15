"use client";

import Link from "next/link";
import { X, ArrowUpRight } from "@phosphor-icons/react";
import type { HallMapVenue } from "@/domain/hall-map";
import { hallCapacitySummary } from "@/domain/hall-map";
import { hallTags } from "@/lib/labels";
import { FavoriteButton } from "./FavoriteButton";
import { HallPhotoMedia } from "./HallPhotoMedia";

export function HallMapCard({
  venue,
  onClose,
}: {
  venue: HallMapVenue;
  onClose: () => void;
}) {
  const allPhotos = venue.halls.flatMap(({ hall }) => hall.photos || []).filter(Boolean);
  const primaryPhoto = allPhotos[0];

  return (
    <article className="map-preview-card hall-map-preview-card" aria-label={`${venue.venueName} 요약 정보`}>
      <button
        type="button"
        className="map-preview-card-close"
        onClick={onClose}
        aria-label="카드 닫기"
      >
        <X size={18} />
      </button>

      <div className="map-preview-card-visual-wrapper">
        {primaryPhoto ? (
          <HallPhotoMedia photo={primaryPhoto} variant="card" />
        ) : (
          <div className="hall-photo-placeholder" style={{ padding: 0, overflow: "hidden" }}>
            <img
              src="/viewdding-home-clean-v63.png"
              alt={venue.venueName}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
            />
          </div>
        )}
      </div>

      <div className="map-preview-card-content">
        <div className="map-preview-card-top">
          <span className="map-preview-kicker">웨딩홀 · 개별홀 {venue.halls.length}개</span>
          <h3 className="map-preview-title">{venue.venueName}</h3>
          <p className="map-preview-location">
            {venue.district}
            {venue.address ? ` · ${venue.address}` : ""}
          </p>
        </div>

        <div className="map-preview-halls-list">
          {venue.halls.map(({ hall, unknownReasons }) => (
            <div className="map-preview-hall-item" key={hall.id}>
              <div className="map-preview-hall-info">
                <Link href={`/halls/${hall.id}/`} className="map-preview-hall-name">
                  {hall.hallName}
                </Link>
                <span className="map-preview-hall-capacity">
                  {hallCapacitySummary(hall) ?? "수용 인원 문의"}
                </span>
                <div className="chip-row compact-chips">
                  {hallTags(hall).slice(0, 2).map((tag) => (
                    <span key={tag} className="chip">{tag}</span>
                  ))}
                </div>
              </div>
              <FavoriteButton itemId={hall.id} category="halls" compact />
            </div>
          ))}
        </div>

        <div className="map-preview-card-footer">
          {venue.placeUrl ? (
            <a href={venue.placeUrl} target="_blank" rel="noreferrer" className="portal-mini-link">
              <span>카카오맵에서 보기</span>
              <ArrowUpRight size={12} />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
