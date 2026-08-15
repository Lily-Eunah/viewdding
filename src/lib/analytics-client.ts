"use client";

import { useEffect, useRef } from "react";
import type {
  AnalyticsEventRecord,
  AnalyticsEventType,
  OutboundTargetType,
  VendorCategory,
} from "@/domain/analytics-types";

const VISITOR_KEY = "viewdding_vid";
const SESSION_KEY = "viewdding_sid";

function getDeviceType(): "mobile" | "desktop" | "tablet" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  } catch {
    return "anon_fallback";
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "session_fallback";
  }
}

export function trackAnalyticsEvent(payload: {
  eventType: AnalyticsEventType;
  pagePath?: string;
  category?: VendorCategory | string;
  vendorId?: string;
  vendorName?: string;
  targetType?: OutboundTargetType;
  targetUrl?: string;
  region?: string;
  isSponsored?: boolean;
}) {
  if (typeof window === "undefined") return;

  const event: AnalyticsEventRecord = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    eventType: payload.eventType,
    visitorId: getOrCreateVisitorId(),
    sessionId: getOrCreateSessionId(),
    pagePath: payload.pagePath || window.location.pathname,
    category: payload.category,
    vendorId: payload.vendorId,
    vendorName: payload.vendorName,
    targetType: payload.targetType,
    targetUrl: payload.targetUrl,
    region: payload.region,
    isSponsored: payload.isSponsored,
    referrer: document.referrer || undefined,
    timestamp: new Date().toISOString(),
    device: getDeviceType(),
  };

  const payloadString = JSON.stringify(event);

  // Send via sendBeacon first (survives page unloads)
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([payloadString], { type: "application/json" });
      const success = navigator.sendBeacon("/api/analytics/track", blob);
      if (success) return;
    } catch {
      // fallback to fetch
    }
  }

  // Fallback to keepalive fetch
  try {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payloadString,
      keepalive: true,
    }).catch(() => {
      // silent catch
    });
  } catch {
    // silent catch
  }
}

// Convenience trackers
export function trackPageView(path?: string, category?: string) {
  trackAnalyticsEvent({
    eventType: "page_view",
    pagePath: path,
    category,
  });
}

export function trackCardImpression(options: {
  vendorId: string;
  vendorName: string;
  category?: VendorCategory | string;
  region?: string;
  isSponsored?: boolean;
}) {
  trackAnalyticsEvent({
    eventType: "card_impression",
    ...options,
  });
}

export function trackDetailView(options: {
  vendorId: string;
  vendorName: string;
  category?: VendorCategory | string;
  region?: string;
  isSponsored?: boolean;
}) {
  trackAnalyticsEvent({
    eventType: "detail_view",
    ...options,
  });
}

export function trackOutboundClick(options: {
  vendorId: string;
  vendorName: string;
  targetType: OutboundTargetType;
  targetUrl?: string;
  category?: VendorCategory | string;
  region?: string;
  isSponsored?: boolean;
}) {
  trackAnalyticsEvent({
    eventType: "outbound_click",
    ...options,
  });
}

export function trackFavoriteToggle(options: {
  vendorId: string;
  category?: string;
  isFavorite: boolean;
}) {
  trackAnalyticsEvent({
    eventType: "favorite_toggle",
    vendorId: options.vendorId,
    category: options.category,
  });
}

/**
 * Hook to automatically track card impressions when element enters viewport for >= 500ms
 */
export function useCardImpression<T extends HTMLElement = HTMLDivElement>(options: {
  vendorId: string;
  vendorName: string;
  category?: VendorCategory | string;
  region?: string;
  isSponsored?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasTracked.current || typeof IntersectionObserver === "undefined") return;

    let timer: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasTracked.current) {
          // Trigger after 400ms dwelling
          timer = setTimeout(() => {
            if (!hasTracked.current) {
              hasTracked.current = true;
              trackCardImpression(options);
            }
          }, 400);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [options.vendorId, options.vendorName, options.category, options.region, options.isSponsored]);

  return ref;
}
