"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ArrowUpRight } from "@phosphor-icons/react";
import type { RestaurantRecord } from "@/domain/restaurant-types";
import {
  restaurantClosedBadgeLabel,
  restaurantParkingLabel,
  restaurantPriceLabel,
  restaurantRoomLabel,
  restaurantStationCleanLabel,
} from "@/lib/restaurant-labels";
import { restaurantSlug } from "@/lib/restaurant-routes";
import { getRestaurantBrandFallback } from "@/lib/restaurant-visuals";
import { FavoriteButton } from "./FavoriteButton";

export function RestaurantMapCard({
  restaurant,
  onClose,
}: {
  restaurant: RestaurantRecord;
  onClose: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const displayName = `${restaurant.name}${restaurant.branch ? ` ${restaurant.branch}` : ""}`;
  const detailUrl = `/restaurants/${restaurantSlug(restaurant)}/`;
  const hasPhoto = Boolean(restaurant.photoUrl) && !imgFailed;
  const fallbackVisual = getRestaurantBrandFallback(restaurant);
  const closedBadge = restaurantClosedBadgeLabel(restaurant);
  const cleanStation = restaurantStationCleanLabel(restaurant);
  const categoryKicker = restaurant.venueType || restaurant.cuisines.slice(0, 2).join("·") || "다이닝";

  return (
    <article className="map-preview-card restaurant-map-preview-card" aria-label={`${displayName} 요약 정보`}>
      <button
        type="button"
        className="map-preview-card-close"
        onClick={onClose}
        aria-label="카드 닫기"
      >
        <X size={18} />
      </button>

      <div className="map-preview-card-visual-wrapper">
        <Link href={detailUrl} className="map-preview-card-visual-link">
          {hasPhoto ? (
            <img
              src={restaurant.photoUrl!}
              alt={displayName}
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
        </Link>
      </div>

      <div className="map-preview-card-content">
        <div className="map-preview-card-top">
          <div className="map-preview-card-header">
            <span className="map-preview-kicker">{categoryKicker}</span>
            <div className="map-preview-actions">
              <FavoriteButton itemId={restaurant.id} category={restaurant.purpose} compact />
            </div>
          </div>
          <h3 className="map-preview-title">
            <Link href={detailUrl}>{displayName}</Link>
            {closedBadge ? <span className="restaurant-closed-pill">{closedBadge}</span> : null}
          </h3>
          <p className="map-preview-location">
            {restaurant.district}
            {restaurant.area && restaurant.area !== restaurant.district ? ` · ${restaurant.area}` : ""}
            {cleanStation ? ` · ${cleanStation}` : ""}
          </p>
        </div>

        <div className="map-preview-metrics">
          <div className="preview-metric">
            <span className="label">1인 예산</span>
            <span className="val">{restaurantPriceLabel(restaurant)}</span>
          </div>
          <div className="preview-metric">
            <span className="label">룸 정보</span>
            <span className="val">{restaurantRoomLabel(restaurant)}</span>
          </div>
          <div className="preview-metric">
            <span className="label">주차</span>
            <span className="val">{restaurantParkingLabel(restaurant)}</span>
          </div>
        </div>

        <div className="map-preview-card-footer">
          <Link href={detailUrl} className="map-preview-detail-btn">
            <span>상세보기</span>
            <ArrowUpRight size={14} />
          </Link>
          <div className="map-preview-portal-links">
            {restaurant.naverMapUrl ? (
              <a href={restaurant.naverMapUrl} target="_blank" rel="noreferrer" className="portal-mini-link">
                네이버 지도
              </a>
            ) : null}
            {restaurant.kakaoMapUrl ? (
              <a href={restaurant.kakaoMapUrl} target="_blank" rel="noreferrer" className="portal-mini-link">
                카카오맵
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
