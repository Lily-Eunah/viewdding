"use client";

import { useEffect } from "react";
import { trackDetailView, trackOutboundClick } from "@/lib/analytics-client";

export function RestaurantDetailTracker({
  vendorId,
  vendorName,
  region,
}: {
  vendorId: string;
  vendorName: string;
  region?: string;
}) {
  useEffect(() => {
    trackDetailView({
      vendorId,
      vendorName,
      category: "gathering_restaurant",
      region,
    });
  }, [vendorId, vendorName, region]);

  return null;
}

export function RestaurantDetailOutboundLink({
  vendorId,
  vendorName,
  targetType,
  targetUrl,
  region,
  className,
  children,
}: {
  vendorId: string;
  vendorName: string;
  targetType: "naver_map" | "kakao_map" | "blog_review" | "instagram" | "phone";
  targetUrl: string;
  region?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const handleClick = () => {
    trackOutboundClick({
      vendorId,
      vendorName,
      targetType,
      targetUrl,
      category: "gathering_restaurant",
      region,
    });
  };

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
