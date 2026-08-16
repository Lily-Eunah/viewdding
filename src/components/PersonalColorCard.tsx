"use client";

import { useId } from "react";
import { InstagramLogo, Article } from "@phosphor-icons/react";
import type { PersonalColorRecord } from "@/domain/personal-color-types";
import { serviceTagMeta } from "@/domain/personal-color-categories";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatPersonalColorPrice } from "@/lib/personal-colors";
import { trackOutboundClick, useCardImpression } from "@/lib/analytics-client";

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

export function PersonalColorCard({
  vendor,
  unknownReasons = [],
}: {
  vendor: PersonalColorRecord;
  unknownReasons?: string[];
}) {
  const priceDisplay = formatPersonalColorPrice(vendor);
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

  return (
    <article className="restaurant-card personal-color-no-img-card" ref={cardRef}>
      <div className="restaurant-card-main-grid">
        {/* Left / Main Body Info */}
        <div className="restaurant-card-body">
          <div className="restaurant-card-top-section">
            <div className="restaurant-kicker-row">
              <p className="restaurant-kicker">{categoryKicker}</p>
              <div className="restaurant-top-portal-links">
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
                    <Article size={20} weight="bold" color="#64748B" />
                  </a>
                ) : null}
                <FavoriteButton itemId={vendor.id} category="wedding_color" variant="portal" />
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
            </div>

            <p className="restaurant-location-line">
              <span>{vendor.district}</span>
              {vendor.address && vendor.address !== vendor.district ? <span> · {vendor.address}</span> : null}
            </p>

            {vendor.evidence ? <p className="restaurant-point">{vendor.evidence}</p> : null}
          </div>

          {/* Bottom chips row (Service and Styling Tags only) */}
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

        {/* Right Metrics Column */}
        <div className="restaurant-card-metrics-col">
          <dl className="restaurant-metrics-grid">
            <div className="metric-box" title={vendor.priceRaw || priceDisplay}>
              <dt>예상 비용</dt>
              <dd>{priceDisplay}</dd>
            </div>
            <div className="metric-box" title={vendor.services.join(", ")}>
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
        </div>
      </div>
    </article>
  );
}
