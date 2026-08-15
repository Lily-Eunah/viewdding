"use client";

import { useId, useState } from "react";
import { X, MapPin, InstagramLogo, Article, ArrowSquareOut } from "@phosphor-icons/react";
import type { PersonalColorRecord } from "@/domain/personal-color-types";
import { serviceTagMeta } from "@/domain/personal-color-categories";
import { FavoriteButton } from "./FavoriteButton";
import { formatPersonalColorPrice, personalColorGradeBadge, personalColorStatusBadge } from "@/lib/personal-colors";
import { trackOutboundClick } from "@/lib/analytics-client";

function NaverMapAppIcon() {
  const gradId = useId();
  return (
    <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="14" y1="4" x2="14" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0072FF" />
          <stop offset="100%" stopColor="#00D236" />
        </linearGradient>
      </defs>
      <path
        d="M14 4C9.58172 4 6 7.58172 6 12C6 17.5 12.2 23.2 14 24.5C15.8 23.2 22 17.5 22 12C22 7.58172 18.4183 4 14 4Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M10.5 15.5V8.5H12.3L15.7 13.2V8.5H17.5V15.5H15.7L12.3 10.8V15.5H10.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function getPersonalColorGradient(name: string): string {
  const gradients = [
    "linear-gradient(135deg, #FFE4E6 0%, #FECDD3 50%, #FDA4AF 100%)",
    "linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #FBCFE8 100%)",
    "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 50%, #C4B5FD 100%)",
    "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 50%, #A5B4FC 100%)",
    "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export function PersonalColorMapCard({
  vendor,
  onClose,
}: {
  vendor: PersonalColorRecord;
  onClose: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const statusBadge = personalColorStatusBadge(vendor.status);
  const gradeBadge = personalColorGradeBadge(vendor.grade);
  const priceDisplay = formatPersonalColorPrice(vendor);
  const bgGradient = getPersonalColorGradient(vendor.name);

  const handleNaverMapClick = () => {
    trackOutboundClick({
      vendorId: vendor.id,
      vendorName: vendor.name,
      targetType: "naver_map",
      targetUrl: vendor.naverMapUrl || undefined,
      category: "wedding_personal_color",
      region: vendor.district,
    });
  };

  const handleInstagramClick = () => {
    trackOutboundClick({
      vendorId: vendor.id,
      vendorName: vendor.name,
      targetType: "instagram",
      targetUrl: vendor.instagramUrl || undefined,
      category: "wedding_personal_color",
      region: vendor.district,
    });
  };

  const handleReviewClick = () => {
    trackOutboundClick({
      vendorId: vendor.id,
      vendorName: vendor.name,
      targetType: "blog_review",
      targetUrl: vendor.reviewUrl || undefined,
      category: "wedding_personal_color",
      region: vendor.district,
    });
  };

  return (
    <article className="map-preview-card personal-color-map-card" aria-label={`${vendor.name} 요약 정보`}>
      <button
        type="button"
        className="map-preview-card-close"
        onClick={onClose}
        aria-label="카드 닫기"
      >
        <X size={18} />
      </button>

      <div className="map-preview-card-visual-wrapper" style={{ background: bgGradient }}>
        {vendor.photoUrl && !imgFailed ? (
          <img
            src={vendor.photoUrl}
            alt={vendor.name}
            className="map-preview-card-img"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="personal-color-brand-visual" style={{ padding: "12px" }}>
            <span className="brand-visual-icon" style={{ fontSize: "1.8rem" }}>
              🎨
            </span>
            <span className="brand-visual-label" style={{ fontSize: "0.72rem" }}>
              웨딩 컬러진단
            </span>
          </div>
        )}
      </div>

      <div className="map-preview-card-content">
        <div className="map-preview-card-top">
          <div className="map-preview-card-header">
            <div className="personal-color-badges">
              <span className={`personal-color-status-pill tone-${statusBadge.tone}`}>
                {statusBadge.label}
              </span>
              <span className={`personal-color-grade-pill ${gradeBadge.tone}`}>
                {gradeBadge.label}
              </span>
            </div>
            <div className="map-preview-actions">
              <FavoriteButton itemId={vendor.id} category="wedding_color" compact />
            </div>
          </div>

          <h3 className="map-preview-title">
            {vendor.naverMapUrl ? (
              <a href={vendor.naverMapUrl} target="_blank" rel="noreferrer" onClick={handleNaverMapClick}>
                {vendor.name}
              </a>
            ) : (
              vendor.name
            )}
          </h3>

          <p className="map-preview-location">
            <MapPin size={13} weight="fill" className="location-pin-icon" />
            <span>{vendor.address || vendor.district}</span>
          </p>
        </div>

        <div className="personal-color-tags-row" style={{ marginTop: "6px", marginBottom: "6px" }}>
          {vendor.serviceTags
            .filter((t) => t !== "color")
            .slice(0, 3)
            .map((tag) => {
              const meta = serviceTagMeta(tag);
              return (
                <span key={tag} className="personal-color-tag-chip" style={{ fontSize: "0.72rem", padding: "2px 7px" }}>
                  {meta.shortLabel}
                </span>
              );
            })}
        </div>

        <div className="map-preview-metrics">
          <div className="preview-metric">
            <span className="label">예상 비용</span>
            <span className="val">{priceDisplay}</span>
          </div>
          <div className="preview-metric">
            <span className="label">검증 근거</span>
            <span className="val" style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {vendor.evidence || "후기 확인"}
            </span>
          </div>
        </div>

        <div className="map-preview-card-actions" style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
          {vendor.naverMapUrl ? (
            <a
              href={vendor.naverMapUrl}
              target="_blank"
              rel="noreferrer"
              className="map-preview-outbound-btn"
              onClick={handleNaverMapClick}
            >
              <NaverMapAppIcon />
              <span>네이버 지도</span>
            </a>
          ) : null}
          {vendor.instagramUrl ? (
            <a
              href={vendor.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="map-preview-outbound-btn"
              onClick={handleInstagramClick}
            >
              <InstagramLogo size={16} weight="bold" color="#E1306C" />
              <span>인스타그램</span>
            </a>
          ) : null}
          {vendor.reviewUrl ? (
            <a
              href={vendor.reviewUrl}
              target="_blank"
              rel="noreferrer"
              className="map-preview-outbound-btn"
              onClick={handleReviewClick}
            >
              <Article size={16} weight="bold" color="#475569" />
              <span>후기 보기</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
