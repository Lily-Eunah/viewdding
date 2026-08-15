"use client";

import { useId, useState } from "react";
import { X, InstagramLogo, Article } from "@phosphor-icons/react";
import type { PersonalColorRecord } from "@/domain/personal-color-types";
import { FavoriteButton } from "./FavoriteButton";
import { formatPersonalColorPrice } from "@/lib/personal-colors";
import { trackOutboundClick } from "@/lib/analytics-client";

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

function getPersonalColorFallback(name: string): { bgGradient: string; icon: string; categoryLabel: string } {
  const gradients = [
    "linear-gradient(135deg, #FDE2E4 0%, #FFCAD4 100%)",
    "linear-gradient(135deg, #E2ECE9 0%, #BEE1E6 100%)",
    "linear-gradient(135deg, #DFE7FD 0%, #CDDAFD 100%)",
    "linear-gradient(135deg, #F0E6EF 0%, #D8BBFF 100%)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % gradients.length;
  return {
    bgGradient: gradients[index],
    icon: "🎨",
    categoryLabel: "퍼스널컬러 진단",
  };
}

export function PersonalColorMapCard({
  vendor,
  onClose,
}: {
  vendor: PersonalColorRecord;
  onClose: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const priceDisplay = formatPersonalColorPrice(vendor);
  const hasPhoto = Boolean(vendor.photoUrl) && !imgFailed;
  const fallbackVisual = getPersonalColorFallback(vendor.name);
  const categoryKicker = vendor.services.slice(0, 2).join("·") || "웨딩 퍼스널컬러";

  const handleNaverMapClick = () => {
    trackOutboundClick({
      vendorId: vendor.id,
      vendorName: vendor.name,
      targetType: "naver_map",
      targetUrl: vendor.naverMapUrl || undefined,
      category: "personal_color",
      region: vendor.district,
    });
  };

  const handleInstagramClick = () => {
    trackOutboundClick({
      vendorId: vendor.id,
      vendorName: vendor.name,
      targetType: "instagram",
      targetUrl: vendor.instagramUrl || undefined,
      category: "personal_color",
      region: vendor.district,
    });
  };

  const handleReviewClick = () => {
    trackOutboundClick({
      vendorId: vendor.id,
      vendorName: vendor.name,
      targetType: "blog_review",
      targetUrl: vendor.reviewUrl || undefined,
      category: "personal_color",
      region: vendor.district,
    });
  };

  return (
    <article className="map-preview-card" aria-label={`${vendor.name} 요약 정보`}>
      <button
        type="button"
        className="map-preview-card-close"
        onClick={onClose}
        aria-label="카드 닫기"
      >
        <X size={18} />
      </button>

      <div className="map-preview-card-visual-wrapper">
        <a
          href={vendor.naverMapUrl || "#"}
          target="_blank"
          rel="noreferrer"
          className="map-preview-card-visual-link"
          onClick={handleNaverMapClick}
        >
          {hasPhoto ? (
            <img
              src={vendor.photoUrl!}
              alt={vendor.name}
              className="map-preview-card-img"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div
              className="map-preview-brand-visual"
              style={{ background: fallbackVisual.bgGradient }}
            >
              <span className="brand-visual-icon" role="img" aria-label={fallbackVisual.categoryLabel}>
                {fallbackVisual.icon}
              </span>
              <span className="brand-visual-label">{fallbackVisual.categoryLabel}</span>
            </div>
          )}
        </a>
      </div>

      <div className="map-preview-card-content">
        <div className="map-preview-card-top">
          <div className="map-preview-card-header">
            <span className="map-preview-kicker">{categoryKicker}</span>
            <div className="map-preview-actions">
              <FavoriteButton itemId={vendor.id} category="wedding_color" compact />
            </div>
          </div>
          <h3 className="map-preview-title">
            <a href={vendor.naverMapUrl || "#"} target="_blank" rel="noreferrer" onClick={handleNaverMapClick}>
              {vendor.name}
            </a>
          </h3>
          <p className="map-preview-location">
            {vendor.district}
            {vendor.address && vendor.address !== vendor.district ? ` · ${vendor.address}` : ""}
          </p>
        </div>

        <div className="map-preview-metrics">
          <div className="preview-metric">
            <span className="label">예상 비용</span>
            <span className="val">{priceDisplay}</span>
          </div>
          <div className="preview-metric">
            <span className="label">주요 진단</span>
            <span className="val">{vendor.services[0] || "퍼스널컬러"}</span>
          </div>
          <div className="preview-metric">
            <span className="label">골격/체형</span>
            <span className="val">{vendor.serviceTags.includes("body_shape") ? "포함" : "미포함"}</span>
          </div>
        </div>

        <div className="map-preview-card-footer">
          {vendor.naverMapUrl ? (
            <a
              href={vendor.naverMapUrl}
              target="_blank"
              rel="noreferrer"
              className="map-preview-detail-btn"
              onClick={handleNaverMapClick}
            >
              <span>네이버 지도</span>
            </a>
          ) : null}
          <div className="map-preview-portal-links">
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
                className="portal-icon-only-btn"
                title="인스타그램에서 열기"
                aria-label="인스타그램에서 열기"
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
                title="후기 보기"
                aria-label="후기 보기"
                onClick={handleReviewClick}
              >
                <Article size={20} weight="bold" color="#64748B" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
