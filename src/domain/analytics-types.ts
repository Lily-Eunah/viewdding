export type AnalyticsEventType =
  | "page_view"
  | "card_impression"
  | "detail_view"
  | "favorite_toggle"
  | "outbound_click"
  | "share_click";

export type OutboundTargetType =
  | "naver_map"
  | "kakao_map"
  | "instagram"
  | "phone"
  | "website"
  | "homepage"
  | "blog_review"
  | "reservation";

export type VendorCategory =
  | "gathering_restaurant"
  | "wedding_hall"
  | "personal_color"
  | "second_dress"
  | "groom_suit"
  | "hair_makeup"
  | "gift_table"
  | "general";

export interface AnalyticsEventRecord {
  id: string;
  eventType: AnalyticsEventType;
  visitorId: string;
  sessionId: string;
  pagePath: string;
  category?: VendorCategory | string;
  vendorId?: string;
  vendorName?: string;
  targetType?: OutboundTargetType;
  targetUrl?: string;
  region?: string;
  isSponsored?: boolean;
  referrer?: string;
  timestamp: string; // ISO 8601
  device?: "mobile" | "desktop" | "tablet";
}

export interface FunnelMetrics {
  impressions: number;
  detailViews: number;
  outboundClicks: number;
  favorites: number;
  ctr: number; // (detailViews / impressions) * 100
  outboundConversionRate: number; // (outboundClicks / detailViews) * 100
  estimatedMediaValue: number; // outboundClicks * default CPC (e.g. 1000 KRW)
}

export interface OutboundBreakdown {
  naverMap: number;
  kakaoMap: number;
  instagram: number;
  phone: number;
  website: number;
  blogReview: number;
  reservation: number;
}

export interface VendorPerformanceSummary {
  vendorId: string;
  vendorName: string;
  category: VendorCategory | string;
  region?: string;
  isSponsored?: boolean;
  metrics: FunnelMetrics;
  outboundBreakdown: OutboundBreakdown;
  dailyTrend: {
    date: string; // YYYY-MM-DD
    impressions: number;
    detailViews: number;
    outboundClicks: number;
  }[];
  categoryRank: {
    rank: number;
    totalInCategory: number;
    percentile: number; // e.g. Top 8%
  };
  sponsorshipProjection?: {
    currentMonthlyLeads: number;
    projectedSponsoredLeads: number;
    monthlyAdFee: number; // e.g. 300,000 KRW
    effectiveCpc: number; // monthlyAdFee / projectedSponsoredLeads
    estimatedMarketValue: number; // projectedSponsoredLeads * 1,200 KRW
  };
}

export interface CategorySummary {
  category: VendorCategory | string;
  label: string;
  pv: number;
  uv: number;
  vendorCount: number;
  totalOutboundClicks: number;
  sharePercentage: number;
}

export interface AnalyticsSummary {
  periodDays: number;
  topFunnel: {
    totalPv: number;
    totalUv: number;
    pvGrowthWoW: number;
    uvGrowthWoW: number;
    pvGrowthMoM: number;
    uvGrowthMoM: number;
    categories: CategorySummary[];
    dailyTraffic: {
      date: string;
      pv: number;
      uv: number;
    }[];
  };
  midFunnel: {
    totalImpressions: number;
    totalDetailViews: number;
    totalFavorites: number;
    averageCtr: number;
  };
  bottomFunnel: {
    totalOutboundClicks: number;
    averageOutboundConversionRate: number;
    totalEstimatedMediaValue: number;
    outboundBreakdown: OutboundBreakdown;
  };
  topVendors: VendorPerformanceSummary[];
  recentOutboundEvents: AnalyticsEventRecord[];
  adSlots: {
    activeSponsorsCount: number;
    totalSlotsCount: number;
    estimatedMonthlyRevenue: number;
  };
}
