"use client";

import { useId, useState } from "react";
import {
  Sparkle,
  InstagramLogo,
  ArrowSquareOut,
  MapPin,
  CheckCircle,
  Article,
} from "@phosphor-icons/react";
import type { PersonalColorRecord } from "@/domain/personal-color-types";
import { serviceTagMeta } from "@/domain/personal-color-categories";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatPersonalColorPrice, personalColorGradeBadge, personalColorStatusBadge } from "@/lib/personal-colors";
import { trackDetailView, trackOutboundClick, useCardImpression } from "@/lib/analytics-client";

function NaverMapAppIcon() {
  const gradId = useId();
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
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

// Generate pastel gradient based on vendor name for brand fallback
function getPersonalColorGradient(name: string): string {
  const gradients = [
    "linear-gradient(135deg, #FFE4E6 0%, #FECDD3 50%, #FDA4AF 100%)",
    "linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #FBCFE8 100%)",
    "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 50%, #C4B5FD 100%)",
    "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 50%, #A5B4FC 100%)",
    "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)",
    "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 50%, #7DD3FC 100%)",
    "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export function PersonalColorCard({
  vendor,
  unknownReasons = [],
}: {
  vendor: PersonalColorRecord;
  unknownReasons?: string[];
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const statusBadge = personalColorStatusBadge(vendor.status);
  const gradeBadge = personalColorGradeBadge(vendor.grade);
  const priceDisplay = formatPersonalColorPrice(vendor);
  const bgGradient = getPersonalColorGradient(vendor.name);

  // Hook for 500ms viewport dwell impression logging
  const cardRef = useCardImpression<HTMLElement>({
    vendorId: vendor.id,
    vendorName: vendor.name,
    category: "wedding_personal_color",
    region: vendor.district,
  });

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

  const portalLinks = (
    <div className="restaurant-portal-links">
      {vendor.naverMapUrl ? (
        <a
          href={vendor.naverMapUrl}
          target="_blank"
          rel="noreferrer"
          className="portal-icon-only-btn"
          title="네이버 지도에서 열기"
          aria-label="네이버 지도에서 열기"
          onClick={handleNaverMapClick}
        >
          <NaverMapAppIcon />
        </a>
      ) : null}
      {vendor.instagramUrl ? (
        <a
          href={vendor.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="portal-icon-only-btn instagram-portal-btn"
          title="공식 인스타그램 보기"
          aria-label="공식 인스타그램 보기"
          onClick={handleInstagramClick}
        >
          <InstagramLogo size={20} weight="bold" color="#E1306C" />
        </a>
      ) : null}
      {vendor.reviewUrl ? (
        <a
          href={vendor.reviewUrl}
          target="_blank"
          rel="noreferrer"
          className="portal-icon-only-btn"
          title="실제 후기 및 정보 보기"
          aria-label="실제 후기 및 정보 보기"
          onClick={handleReviewClick}
        >
          <Article size={20} weight="bold" color="#475569" />
        </a>
      ) : null}
    </div>
  );

  return (
    <article className="restaurant-card personal-color-card" ref={cardRef}>
      <div className="restaurant-card-main-grid">
        {/* Left Visual Thumbnail Area */}
        <div className="restaurant-card-visual-wrapper" style={{ background: bgGradient }}>
          {vendor.photoUrl && !imgFailed ? (
            <img
              src={vendor.photoUrl}
              alt={vendor.name}
              className="restaurant-card-img"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="personal-color-brand-visual">
              <span className="brand-visual-icon" role="img" aria-label="웨딩 퍼스널컬러">
                🎨
              </span>
              <span className="brand-visual-label">웨딩 컬러진단</span>
              <span className="brand-visual-watermark">Viewdding</span>
            </div>
          )}
        </div>

        {/* Center / Main Body Info */}
        <div className="restaurant-card-body">
          <div className="restaurant-card-top-section">
            <div className="restaurant-kicker-row">
              <div className="personal-color-badges">
                <span className={`personal-color-status-pill tone-${statusBadge.tone}`}>
                  {statusBadge.label}
                </span>
                <span className={`personal-color-grade-pill ${gradeBadge.tone}`}>
                  {gradeBadge.label}
                </span>
              </div>
              <div className="restaurant-top-portal-links">
                {portalLinks}
                <FavoriteButton itemId={vendor.id} category="wedding_color" compact />
              </div>
            </div>

            <div className="restaurant-title-row">
              <h3 className="restaurant-card-title">
                {vendor.naverMapUrl ? (
                  <a
                    href={vendor.naverMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleNaverMapClick}
                  >
                    {vendor.name}
                  </a>
                ) : (
                  vendor.name
                )}
              </h3>
              <span className="personal-color-price-pill">{priceDisplay}</span>
            </div>

            <p className="restaurant-location-line">
              <MapPin size={14} weight="fill" className="location-pin-icon" />
              <span>{vendor.address || vendor.district}</span>
            </p>
          </div>

          {/* Service Feature Tags */}
          <div className="personal-color-tags-row">
            {vendor.serviceTags
              .filter((t) => t !== "color")
              .slice(0, 4)
              .map((tag) => {
                const meta = serviceTagMeta(tag);
                return (
                  <span key={tag} className="personal-color-tag-chip" title={meta.description}>
                    {meta.shortLabel}
                  </span>
                );
              })}
            {vendor.services.slice(0, 2).map((srv, idx) => (
              <span key={idx} className="personal-color-sub-chip">
                {srv}
              </span>
            ))}
          </div>

          {/* Evidence / Highlights Bubble */}
          {vendor.evidence ? (
            <div className="personal-color-evidence-box">
              <p className="evidence-text">
                <Sparkle size={13} weight="fill" className="sparkle-icon" />
                <span>{vendor.evidence}</span>
              </p>
              {vendor.notes ? <p className="notes-text">{vendor.notes}</p> : null}
            </div>
          ) : null}

          {/* Unknown reasons warning if any */}
          {unknownReasons.length > 0 ? (
            <div className="restaurant-unknown-box">
              <p className="unknown-title">확인 필요 항목</p>
              <ul className="unknown-list">
                {unknownReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
