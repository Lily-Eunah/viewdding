"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { RestaurantRecord } from "@/domain/restaurant-types";
import { FavoriteButton } from "@/components/FavoriteButton";
import {
  gatheringPurposeLabel,
  restaurantClosedBadgeLabel,
  restaurantParkingLabel,
  restaurantPriceLabel,
  restaurantRoomLabel,
  restaurantStationCleanLabel,
} from "@/lib/restaurant-labels";
import { restaurantSlug } from "@/lib/restaurant-routes";
import { getRestaurantBrandFallback } from "@/lib/restaurant-visuals";
import {
  trackDetailView,
  trackOutboundClick,
  useCardImpression,
} from "@/lib/analytics-client";

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

function KakaoMapAppIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect width="28" height="28" rx="6" fill="#FEE500" />
      <path
        d="M14 6C10.6863 6 8 8.68629 8 12C8 15.866 12.5 21.5 14 23C15.5 21.5 20 15.866 20 12C20 8.68629 17.3137 6 14 6Z"
        fill="#0075FF"
      />
      <circle cx="14" cy="11.8" r="2.6" fill="#FEE500" />
    </svg>
  );
}

export function RestaurantCard({
  restaurant,
  unknownReasons = [],
}: {
  restaurant: RestaurantRecord;
  unknownReasons?: string[];
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const displayName = `${restaurant.name}${restaurant.branch ? ` ${restaurant.branch}` : ""}`;
  const vId = restaurantSlug(restaurant);
  const detailUrl = `/restaurants/${vId}/`;
  const hasPhoto = Boolean(restaurant.photoUrl) && !imgFailed;
  const fallbackVisual = getRestaurantBrandFallback(restaurant);
  const closedBadge = restaurantClosedBadgeLabel(restaurant);
  const cleanStation = restaurantStationCleanLabel(restaurant);

  // Hook for 500ms viewport dwell impression logging
  const cardRef = useCardImpression<HTMLElement>({
    vendorId: vId,
    vendorName: displayName,
    category: "gathering_restaurant",
    region: restaurant.district,
  });

  const handleDetailClick = () => {
    trackDetailView({
      vendorId: vId,
      vendorName: displayName,
      category: "gathering_restaurant",
      region: restaurant.district,
    });
  };

  const handleNaverMapClick = () => {
    trackOutboundClick({
      vendorId: vId,
      vendorName: displayName,
      targetType: "naver_map",
      targetUrl: restaurant.naverMapUrl || undefined,
      category: "gathering_restaurant",
      region: restaurant.district,
    });
  };

  const handleKakaoMapClick = () => {
    trackOutboundClick({
      vendorId: vId,
      vendorName: displayName,
      targetType: "kakao_map",
      targetUrl: restaurant.kakaoMapUrl || undefined,
      category: "gathering_restaurant",
      region: restaurant.district,
    });
  };

  // Filter out redundant tags that duplicate purpose/district/cuisine
  const rawTags = [...(restaurant.captionTags || [])];
  const uniqueTags = rawTags
    .filter(
      (tag) =>
        tag !== "상견례" &&
        tag !== "청첩장" &&
        tag !== "청첩장모임" &&
        tag !== restaurant.district &&
        tag !== restaurant.area &&
        !restaurant.cuisines.includes(tag) &&
        tag !== restaurant.venueType
    )
    .slice(0, 3);

  const categoryKicker = restaurant.venueType || restaurant.cuisines.slice(0, 2).join("·") || "다이닝";

  const portalLinks = (
    <div className="restaurant-portal-links">
      {restaurant.naverMapUrl ? (
        <a
          href={restaurant.naverMapUrl}
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
      {restaurant.kakaoMapUrl ? (
        <a
          href={restaurant.kakaoMapUrl}
          target="_blank"
          rel="noreferrer"
          className="portal-icon-only-btn"
          title="카카오맵에서 열기"
          aria-label="카카오맵에서 열기"
          onClick={handleKakaoMapClick}
        >
          <KakaoMapAppIcon />
        </a>
      ) : null}
    </div>
  );

  return (
    <article className="restaurant-card" ref={cardRef}>
      <div className="restaurant-card-main-grid">
        {/* Left Visual Thumbnail Area */}
        <Link href={detailUrl} className="restaurant-card-visual-link" onClick={handleDetailClick}>
          <div
            className="restaurant-card-visual-wrapper"
            style={!hasPhoto ? { background: fallbackVisual.bgGradient } : undefined}
          >
            {hasPhoto ? (
              <>
                <img
                  src={restaurant.photoUrl!}
                  alt={displayName}
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
        </Link>

        {/* Center / Main Body Info */}
        <div className="restaurant-card-body">
          <div className="restaurant-card-top-section">
            <div className="restaurant-kicker-row">
              <Link href={detailUrl} className="restaurant-kicker-link">
                <p className="restaurant-kicker">{categoryKicker}</p>
              </Link>
              <div className="restaurant-top-portal-links">
                {portalLinks}
                <FavoriteButton itemId={restaurant.id} category={restaurant.purpose} compact />
              </div>
            </div>

            <div className="restaurant-title-row">
              <h3 className="restaurant-card-title">
                <Link href={detailUrl}>{displayName}</Link>
              </h3>
              {closedBadge ? <span className="restaurant-closed-pill">{closedBadge}</span> : null}
            </div>

            <Link href={detailUrl} className="restaurant-location-link">
              <p className="restaurant-location-line">
                <span>{restaurant.district}</span>
                {restaurant.area && restaurant.area !== restaurant.district ? <span> · {restaurant.area}</span> : null}
                {cleanStation ? <span> · {cleanStation}</span> : null}
              </p>
            </Link>
          </div>

          {restaurant.recommendationPoints ? (
            <Link href={detailUrl} className="restaurant-point-link">
              <p className="restaurant-point">{restaurant.recommendationPoints}</p>
            </Link>
          ) : null}

          <div className="restaurant-card-bottom-tags">
            {uniqueTags.length > 0 ? (
              <div className="chip-row">
                {uniqueTags.map((tag) => (
                  <span className="chip" key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
            {unknownReasons.length > 0 ? (
              <p className="unknown-reason">확인 필요: {unknownReasons.join(" · ")}</p>
            ) : null}
          </div>
        </div>

        {/* Right / 4 Metrics (2x2) & Portal Links */}
        <div className="restaurant-card-metrics-col">
          <Link href={detailUrl} className="restaurant-metrics-grid-link">
            <dl className="restaurant-metrics-grid">
              <div className="metric-box">
                <dt>1인 예산</dt>
                <dd>{restaurantPriceLabel(restaurant)}</dd>
              </div>
              <div className="metric-box">
                <dt>프라이빗 룸</dt>
                <dd>{restaurantRoomLabel(restaurant)}</dd>
              </div>
              <div className="metric-box">
                <dt>코스 요리</dt>
                <dd>
                  {restaurant.courseAvailable === "yes"
                    ? "코스 가능"
                    : restaurant.courseAvailable === "no"
                    ? "단품 중심"
                    : "-"}
                </dd>
              </div>
              <div className="metric-box">
                <dt>주차 시설</dt>
                <dd>{restaurantParkingLabel(restaurant)}</dd>
              </div>
            </dl>
          </Link>

          <div className="restaurant-metrics-portal-links">
            {portalLinks}
          </div>
        </div>
      </div>
    </article>
  );
}
