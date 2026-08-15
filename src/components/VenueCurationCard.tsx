"use client";

import { useState } from "react";
import { ArrowSquareOut, Heart, MapPin, NavigationArrow } from "@phosphor-icons/react";
import { trackOutboundClick } from "@/lib/analytics-client";

export interface VenueCurationCardProps {
  id: string;
  name: string;
  category: "studio" | "hotel" | "outdoor";
  regionLabel: string;
  address?: string;
  thumbnailUrl: string;
  features: string[];
  priceInfo?: string;
  bestTimeTip?: string;
  editorNote: string;
  bookingUrl?: string;
  mapUrl?: string;
  isAffiliate?: boolean;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

function getCategoryBadge(category: string): { label: string; className: string } {
  if (category === "studio") return { label: "스튜디오", className: "badge-studio" };
  if (category === "hotel") return { label: "호텔/파티룸", className: "badge-hotel" };
  return { label: "야외명소", className: "badge-outdoor" };
}

export function VenueCurationCard({
  id,
  name,
  category,
  regionLabel,
  address,
  thumbnailUrl,
  features,
  priceInfo,
  bestTimeTip,
  editorNote,
  bookingUrl,
  mapUrl,
  isAffiliate = false,
  isSaved = false,
  onToggleSave,
}: VenueCurationCardProps) {
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const catBadge = getCategoryBadge(category);

  const handleBookingClick = () => {
    if (bookingUrl) {
      trackOutboundClick({
        vendorId: id,
        vendorName: name,
        targetType: "reservation",
        targetUrl: bookingUrl,
        category: "self_snap_venue",
      });
    }
  };

  const handleMapClick = () => {
    if (mapUrl) {
      trackOutboundClick({
        vendorId: id,
        vendorName: name,
        targetType: "naver_map",
        targetUrl: mapUrl,
        category: "self_snap_venue",
      });
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = !saved;
    setSaved(nextSaved);
    if (onToggleSave) {
      onToggleSave(id);
    }
  };

  return (
    <article className="venue-curation-card">
      <div className="venue-image-wrap">
        <img
          src={
            imgError || !thumbnailUrl
              ? "/viewdding-hero-v48.png"
              : thumbnailUrl
          }
          alt={name}
          className="venue-card-image"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="venue-badges">
          <span className={`venue-badge ${catBadge.className}`}>{catBadge.label}</span>
          <span className="venue-badge region">{regionLabel}</span>
        </div>

        <button
          type="button"
          className={`venue-heart-btn ${saved ? "saved" : ""}`}
          onClick={handleSaveClick}
          aria-label={saved ? "저장 해제" : "저장하기"}
        >
          <Heart size={18} weight={saved ? "fill" : "regular"} />
        </button>
      </div>

      <div className="venue-card-content">
        <div className="venue-header-row">
          <h3 className="venue-title" title={name}>
            {name}
          </h3>
        </div>

        {address && (
          <p className="venue-address">
            <MapPin size={14} weight="bold" />
            <span>{address}</span>
          </p>
        )}

        <p className="venue-editor-note">{editorNote}</p>

        {/* 대관료 & 골든아워 팁 */}
        <div className="venue-meta-grid">
          {priceInfo && (
            <div className="venue-meta-item">
              <span className="meta-label">대관/비용</span>
              <span className="meta-value">{priceInfo}</span>
            </div>
          )}
          {bestTimeTip && (
            <div className="venue-meta-item wide">
              <span className="meta-label">💡 추천 시간/팁</span>
              <span className="meta-value">{bestTimeTip}</span>
            </div>
          )}
        </div>

        {/* 특징 태그 */}
        {features && features.length > 0 && (
          <div className="venue-features-row">
            {features.map((feat, idx) => (
              <span key={idx} className="venue-feature-tag">
                {feat}
              </span>
            ))}
          </div>
        )}

        {/* 액션 버튼 (예약 / 길찾기) */}
        <div className="venue-action-buttons">
          {bookingUrl && (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="venue-btn primary"
              onClick={handleBookingClick}
            >
              <span>{category === "hotel" ? "예약 확인하기" : "예약하기"}</span>
              <ArrowSquareOut size={15} weight="bold" />
            </a>
          )}
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="venue-btn secondary"
              onClick={handleMapClick}
            >
              <NavigationArrow size={14} weight="bold" />
              <span>지도/길찾기</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
