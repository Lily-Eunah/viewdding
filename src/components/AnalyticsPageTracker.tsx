"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics-client";

function detectCategoryFromPath(pathname: string): string {
  if (pathname.startsWith("/gatherings") || pathname.startsWith("/restaurants")) {
    return "gathering_restaurant";
  }
  if (pathname.startsWith("/halls") || pathname.startsWith("/seoul") || pathname.startsWith("/gyeonggi")) {
    return "wedding_hall";
  }
  if (pathname.startsWith("/vendors/hair")) return "hair_makeup";
  if (pathname.startsWith("/vendors/dress")) return "second_dress";
  if (pathname.startsWith("/vendors/personal-color")) return "personal_color";
  if (pathname.startsWith("/vendors/suit")) return "groom_suit";
  if (pathname.startsWith("/vendors/gift")) return "gift_table";
  return "general";
}

export function AnalyticsPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const category = detectCategoryFromPath(pathname);
    const fullPath = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    trackPageView(fullPath, category);
  }, [pathname, searchParams]);

  return null;
}
