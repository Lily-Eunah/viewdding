"use client";

import { useId, useState } from "react";
import { InstagramLogo, Article } from "@phosphor-icons/react";
import type { PersonalColorRecord } from "@/domain/personal-color-types";
import { serviceTagMeta } from "@/domain/personal-color-categories";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatPersonalColorPrice } from "@/lib/personal-colors";
import { trackOutboundClick, useCardImpression } from "@/lib/analytics-client";

function NaverMapAppIcon() {
  const gradId = useId();
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
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
    "linear-gradient(135deg, #FFF1E6 0%, #FDD2B5 100%)",
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

export function PersonalColorCard({
  vendor,
  unknownReasons = [],
}: {
  vendor: PersonalColorRecord;
  unknownReasons?: string[];
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const priceDisplay = formatPersonalColorPrice(vendor);
  const hasPhoto = Boolean(vendor.photoUrl) && !imgFailed;
  const fallbackVisual = getPersonalColorFallback(vendor.name);
  const categoryKicker = vendor.services.slice(0, 2).join("·") || "웨딩 퍼스널컬러";

  // Hook for 500ms viewport dwell impression logging
  const cardRef = useCardImpression<HTMLElement>({
    vendorId: vendor.id,
    vendorName: vendor.name,
    category: "personal_color",
    region: vendor.district,
  });

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
          className="portal-icon-only-btn"
          title="공식 인스타그램 보기"
          aria-label="공식 인스타그램 보기"
          onClick={handleInstagramClick}
        >
          <InstagramLogo size={22} weight="bold" color="#E1306C" />
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
          <Article size={22} weight="bold" color="#64748B" />
        </a>
      ) : null}
    </div>
  );

  return (
    <article className="restaurant-card" ref={cardRef}>
      <div className="restaurant-card-main-grid">
        {/* Left Visual Thumbnail Area */}
        <a
          href={vendor.naverMapUrl || "#"}
          target="_blank"
          rel="noreferrer"
          className="restaurant-card-visual-link"
          onClick={handleNaverMapClick}
        >
          <div
            className="restaurant-card-visual-wrapper"
            style={!hasPhoto ? { background: fallbackVisual.bgGradient } : undefined}
          >
            {hasPhoto ? (
              <>
                <img
                  src={vendor.photoUrl!}
                  alt={vendor.name}
                  className="restaurant-card-img"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                />
                <span className="restaurant-visual-badge">지도 등록 사진</span>
              </>
            ) : (
              <div className="restaurant-brand-visual">
                <span className="brand-visual-icon" role="img" aria-label={fallbackVisual.categoryLabel}>
                  {fallbackVisual.icon}
                </span>
                <span className="brand-visual-label">{fallbackVisual.categoryLabel}</span>
                <span className="brand-visual-watermark">Viewdding</span>
              </div>
            )}
          </div>
        </a>

        {/* Center / Main Body Info */}
        <div className="restaurant-card-body">
          <div className="restaurant-card-top-section">
            <div className="restaurant-kicker-row">
              <p className="restaurant-kicker">{categoryKicker}</p>
              <div className="restaurant-top-portal-links">
                {portalLinks}
                <FavoriteButton itemId={vendor.id} category="wedding_color" compact />
              </div>
            </div>

            <div className="restaurant-title-row">
              <h3 className="restaurant-card-title">
                {vendor.naverMapUrl ? (
                  <a href={vendor.naverMapUrl} target="_blank" rel="noreferrer" onClick={handleNaverMapClick}>
                    {vendor.name}
                  </a>
                ) : (
                  vendor.name
                )}
              </h3>
              <span className="restaurant-closed-pill" style={{ background: "#FDF2F8", color: "#BE185D" }}>
                {priceDisplay}
              </span>
            </div>

            <p className="restaurant-location-line">
              <span>{vendor.district}</span>
              {vendor.address && vendor.address !== vendor.district ? <span> · {vendor.address}</span> : null}
            </p>

            {vendor.evidence ? <p className="restaurant-point">{vendor.evidence}</p> : null}
          </div>

          {/* Bottom chips row */}
          <div className="restaurant-card-bottom-tags">
            <div className="chip-row">
              {vendor.serviceTags
                .filter((t) => t !== "color")
                .map((tag) => (
                  <span key={tag} className="chip">
                    {serviceTagMeta(tag).shortLabel}
                  </span>
                ))}
              {vendor.services.slice(0, 2).map((srv, idx) => (
                <span key={idx} className="chip">
                  {srv}
                </span>
              ))}
            </div>
          </div>

          {/* Unknown reasons if any */}
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

        {/* Right Metrics & Actions Column (Desktop) */}
        <div className="restaurant-card-metrics-col">
          <dl className="restaurant-metrics-grid">
            <div className="metric-box">
              <dt>예상 비용</dt>
              <dd>{priceDisplay}</dd>
            </div>
            <div className="metric-box">
              <dt>주요 진단</dt>
              <dd>{vendor.services[0] || "퍼스널컬러"}</dd>
            </div>
            <div className="metric-box">
              <dt>체형/골격</dt>
              <dd>{vendor.serviceTags.includes("body_shape") ? "골격진단 포함" : "컬러 중심"}</dd>
            </div>
            <div className="metric-box">
              <dt>웨딩 스타일</dt>
              <dd>{vendor.serviceTags.includes("dress") ? "드레스/헤메" : "스타일링"}</dd>
            </div>
          </dl>

          <div className="restaurant-metrics-portal-links">
            {portalLinks}
            <FavoriteButton itemId={vendor.id} category="wedding_color" compact />
          </div>
        </div>
      </div>
    </article>
  );
}
