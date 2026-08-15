import fs from "fs";
import path from "path";
import type {
  AnalyticsEventRecord,
  AnalyticsSummary,
  CategorySummary,
  OutboundBreakdown,
  VendorPerformanceSummary,
} from "../domain/analytics-types";
import { restaurants, getRestaurantBySlug } from "./restaurants";
import { restaurantSlug } from "./restaurant-routes";

const DATA_DIR = path.join(process.cwd(), ".data");
const EVENTS_FILE = path.join(DATA_DIR, "analytics-events.jsonl");

// In-memory fallback / cache
let inMemoryEvents: AnalyticsEventRecord[] = [];
let isLoaded = false;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore if cannot create directory
    }
  }
}

function loadEvents(): AnalyticsEventRecord[] {
  if (isLoaded) return inMemoryEvents;
  try {
    ensureDataDir();
    if (fs.existsSync(EVENTS_FILE)) {
      const content = fs.readFileSync(EVENTS_FILE, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);
      inMemoryEvents = lines.map((line) => JSON.parse(line));
    }
  } catch {
    inMemoryEvents = [];
  }
  isLoaded = true;
  return inMemoryEvents;
}

export async function saveAnalyticsEvents(events: AnalyticsEventRecord[]): Promise<void> {
  const existing = loadEvents();
  existing.push(...events);

  try {
    ensureDataDir();
    const lines = events.map((e) => JSON.stringify(e)).join("\n") + "\n";
    fs.appendFileSync(EVENTS_FILE, lines, "utf-8");
  } catch (err) {
    console.warn("[AnalyticsStore] Failed to write events to file, kept in memory", err);
  }
}

// Seed baseline simulated traffic for rich demo & pitching preview
function getBaselineVendors(): { id: string; name: string; category: string; region: string; baselineWeight: number; isSponsored?: boolean }[] {
  const sampleRestaurants = restaurants.slice(0, 30).map((r, idx) => ({
    id: restaurantSlug(r),
    name: `${r.name}${r.branch ? ` ${r.branch}` : ""}`,
    category: "gathering_restaurant",
    region: r.district || "서울",
    baselineWeight: Math.max(0.3, 1.5 - idx * 0.04),
    isSponsored: idx === 0 || idx === 3, // demo sponsored tags
  }));

  const mockLongtailVendors = [
    { id: "hair-01", name: "블랑쉬 헤어변형", category: "hair_makeup", region: "서울 강남구", baselineWeight: 1.8, isSponsored: true },
    { id: "hair-02", name: "뮤제 헤어&메이크업", category: "hair_makeup", region: "서울 서초구", baselineWeight: 1.3 },
    { id: "hair-03", name: "라온 헤어변형", category: "hair_makeup", region: "서울 송파구", baselineWeight: 0.9 },
    { id: "dress-01", name: "아뜰리에 르벨 2부드레스", category: "second_dress", region: "서울 강남구", baselineWeight: 1.6, isSponsored: true },
    { id: "dress-02", name: "메종 드 로랑 2부", category: "second_dress", region: "서울 청담", baselineWeight: 1.2 },
    { id: "color-01", name: "톤앤웨딩 퍼스널컬러", category: "personal_color", region: "서울 마포구", baselineWeight: 1.1 },
    { id: "suit-01", name: "헤리티지 포목 예복", category: "groom_suit", region: "서울 종로구", baselineWeight: 1.0 },
    { id: "gift-01", name: "웨딩아너스 프리미엄 축의대", category: "gift_table", region: "서울 전역", baselineWeight: 0.8 },
  ];

  return [...sampleRestaurants, ...mockLongtailVendors];
}

export function getAllVendorIds(): string[] {
  const baseline = getBaselineVendors();
  const restIds = restaurants.map((r) => restaurantSlug(r));
  return Array.from(new Set([...baseline.map((b) => b.id), ...restIds]));
}

const CATEGORY_META: Record<string, { label: string; baseShare: number }> = {
  gathering_restaurant: { label: "상견례 및 모임 식당", baseShare: 38 },
  wedding_hall: { label: "웨딩홀 & 베뉴", baseShare: 32 },
  hair_makeup: { label: "헤어변형 / 메이크업", baseShare: 12 },
  second_dress: { label: "2부 드레스 / 애프터 드레스", baseShare: 9 },
  personal_color: { label: "웨딩 퍼스널컬러", baseShare: 4 },
  groom_suit: { label: "예복 & 맞춤 테일러", baseShare: 3 },
  gift_table: { label: "축의대 / 답례품", baseShare: 2 },
};

export async function getAnalyticsSummary(periodDays: number = 30): Promise<AnalyticsSummary> {
  const events = loadEvents();
  const baselineVendors = getBaselineVendors();

  // Aggregate real logged events
  const recordedOutboundCount = events.filter((e) => e.eventType === "outbound_click").length;
  const recordedPvCount = events.filter((e) => e.eventType === "page_view").length;
  const recordedImpCount = events.filter((e) => e.eventType === "card_impression").length;
  const recordedDetailCount = events.filter((e) => e.eventType === "detail_view").length;
  const recordedFavCount = events.filter((e) => e.eventType === "favorite_toggle").length;

  // Realistic baseline figures for high-value business dashboard
  const basePv = Math.max(14850, recordedPvCount * 25 + 14850);
  const baseUv = Math.round(basePv * 0.38);

  const categories: CategorySummary[] = Object.entries(CATEGORY_META).map(([key, meta]) => {
    const pv = Math.round((basePv * meta.baseShare) / 100);
    const uv = Math.round((baseUv * meta.baseShare) / 100);
    const outbound = Math.round(pv * 0.082);
    return {
      category: key,
      label: meta.label,
      pv,
      uv,
      vendorCount: key === "gathering_restaurant" ? restaurants.length : key === "wedding_hall" ? 284 : 18,
      totalOutboundClicks: outbound,
      sharePercentage: meta.baseShare,
    };
  });

  const dailyTraffic: { date: string; pv: number; uv: number }[] = [];
  const now = new Date();
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(5, 10); // MM-DD
    const dayFactor = 0.85 + Math.sin(i * 0.5) * 0.2 + (i % 7 >= 5 ? 0.35 : 0); // weekend bump
    const dayPv = Math.round((basePv / periodDays) * dayFactor);
    dailyTraffic.push({
      date: dateStr,
      pv: dayPv,
      uv: Math.round(dayPv * 0.4),
    });
  }

  const outboundBreakdown: OutboundBreakdown = {
    naverMap: Math.round((basePv * 0.045) + events.filter(e => e.targetType === "naver_map").length),
    kakaoMap: Math.round((basePv * 0.018) + events.filter(e => e.targetType === "kakao_map").length),
    instagram: Math.round((basePv * 0.022) + events.filter(e => e.targetType === "instagram").length),
    phone: Math.round((basePv * 0.008) + events.filter(e => e.targetType === "phone").length),
    website: Math.round((basePv * 0.004) + events.filter(e => e.targetType === "website").length),
    blogReview: Math.round((basePv * 0.012) + events.filter(e => e.targetType === "blog_review").length),
    reservation: Math.round((basePv * 0.006) + events.filter(e => e.targetType === "reservation").length),
  };

  const totalOutboundClicks = Object.values(outboundBreakdown).reduce((a, b) => a + b, 0);
  const totalImpressions = Math.round(basePv * 3.4) + recordedImpCount;
  const totalDetailViews = Math.round(basePv * 0.42) + recordedDetailCount;
  const totalFavorites = Math.round(basePv * 0.065) + recordedFavCount;

  // Build vendor summaries
  const topVendors: VendorPerformanceSummary[] = baselineVendors.map((v, index) => {
    const vWeight = v.baselineWeight;
    const vendorEvents = events.filter((e) => e.vendorId === v.id);
    const loggedOutbound = vendorEvents.filter((e) => e.eventType === "outbound_click").length;

    const impressions = Math.round(3200 * vWeight) + vendorEvents.filter((e) => e.eventType === "card_impression").length;
    const detailViews = Math.round(740 * vWeight) + vendorEvents.filter((e) => e.eventType === "detail_view").length;
    const outboundClicks = Math.round(180 * vWeight) + loggedOutbound;
    const favorites = Math.round(55 * vWeight) + vendorEvents.filter((e) => e.eventType === "favorite_toggle").length;
    const ctr = impressions > 0 ? Number(((detailViews / impressions) * 100).toFixed(1)) : 0;
    const conversionRate = detailViews > 0 ? Number(((outboundClicks / detailViews) * 100).toFixed(1)) : 0;
    const estimatedMediaValue = outboundClicks * 1000;

    const naver = Math.round(outboundClicks * 0.58);
    const kakao = Math.round(outboundClicks * 0.22);
    const insta = Math.round(outboundClicks * 0.14);
    const phone = outboundClicks - (naver + kakao + insta);

    // Sponsorship calculation (Top slot simulation)
    const currentMonthlyLeads = outboundClicks;
    const projectedMultiplier = v.isSponsored ? 1.0 : 3.8;
    const projectedSponsoredLeads = Math.round(currentMonthlyLeads * projectedMultiplier);
    const monthlyAdFee = 300000; // 300,000 KRW
    const effectiveCpc = projectedSponsoredLeads > 0 ? Math.round(monthlyAdFee / projectedSponsoredLeads) : 850;

    const rank = index + 1;
    const totalInCategory = baselineVendors.filter((bv) => bv.category === v.category).length || 25;
    const percentile = Math.max(1, Math.round((rank / totalInCategory) * 100));

    return {
      vendorId: v.id,
      vendorName: v.name,
      category: v.category,
      region: v.region,
      isSponsored: v.isSponsored,
      metrics: {
        impressions,
        detailViews,
        outboundClicks,
        favorites,
        ctr,
        outboundConversionRate: conversionRate,
        estimatedMediaValue,
      },
      outboundBreakdown: {
        naverMap: naver,
        kakaoMap: kakao,
        instagram: insta,
        phone: Math.max(0, phone),
        website: 0,
        blogReview: 0,
        reservation: 0,
      },
      dailyTrend: Array.from({ length: 7 }).map((_, di) => {
        const d = new Date(now.getTime() - (6 - di) * 24 * 60 * 60 * 1000);
        return {
          date: d.toISOString().slice(5, 10),
          impressions: Math.round((impressions / 30) * (0.8 + Math.random() * 0.4)),
          detailViews: Math.round((detailViews / 30) * (0.8 + Math.random() * 0.4)),
          outboundClicks: Math.round((outboundClicks / 30) * (0.8 + Math.random() * 0.4)),
        };
      }),
      categoryRank: {
        rank,
        totalInCategory,
        percentile,
      },
      sponsorshipProjection: {
        currentMonthlyLeads,
        projectedSponsoredLeads,
        monthlyAdFee,
        effectiveCpc,
        estimatedMarketValue: projectedSponsoredLeads * 1200,
      },
    };
  });

  const activeSponsorsCount = topVendors.filter((v) => v.isSponsored).length;

  return {
    periodDays,
    topFunnel: {
      totalPv: basePv,
      totalUv: baseUv,
      pvGrowthWoW: 18.4,
      uvGrowthWoW: 22.1,
      pvGrowthMoM: 41.5,
      uvGrowthMoM: 46.2,
      categories,
      dailyTraffic,
    },
    midFunnel: {
      totalImpressions,
      totalDetailViews,
      totalFavorites,
      averageCtr: Number(((totalDetailViews / totalImpressions) * 100).toFixed(1)),
    },
    bottomFunnel: {
      totalOutboundClicks,
      averageOutboundConversionRate: Number(((totalOutboundClicks / totalDetailViews) * 100).toFixed(1)),
      totalEstimatedMediaValue: totalOutboundClicks * 1000,
      outboundBreakdown,
    },
    topVendors,
    recentOutboundEvents: events
      .filter((e) => e.eventType === "outbound_click")
      .slice(-20)
      .reverse(),
    adSlots: {
      activeSponsorsCount,
      totalSlotsCount: 15,
      estimatedMonthlyRevenue: activeSponsorsCount * 300000,
    },
  };
}

export async function getVendorPerformanceSummary(vendorId: string): Promise<VendorPerformanceSummary | null> {
  const summary = await getAnalyticsSummary(30);
  const found = summary.topVendors.find((v) => v.vendorId === vendorId);
  if (found) return found;

  // Fallback: search in restaurants by slug
  const restaurant = getRestaurantBySlug(vendorId);
  if (restaurant) {
    const displayName = `${restaurant.name}${restaurant.branch ? ` ${restaurant.branch}` : ""}`;
    return {
      vendorId: restaurantSlug(restaurant),
      vendorName: displayName,
      category: "gathering_restaurant",
      region: restaurant.district || "서울",
      isSponsored: false,
      metrics: {
        impressions: 2150,
        detailViews: 480,
        outboundClicks: 110,
        favorites: 28,
        ctr: 22.3,
        outboundConversionRate: 22.9,
        estimatedMediaValue: 110000,
      },
      outboundBreakdown: {
        naverMap: 68,
        kakaoMap: 26,
        instagram: 12,
        phone: 4,
        website: 0,
        blogReview: 0,
        reservation: 0,
      },
      dailyTrend: Array.from({ length: 7 }).map((_, i) => ({
        date: `08-${10 + i}`,
        impressions: 60 + i * 5,
        detailViews: 15 + i * 2,
        outboundClicks: 4 + i,
      })),
      categoryRank: {
        rank: 8,
        totalInCategory: 45,
        percentile: 18,
      },
      sponsorshipProjection: {
        currentMonthlyLeads: 110,
        projectedSponsoredLeads: 420,
        monthlyAdFee: 300000,
        effectiveCpc: 714,
        estimatedMarketValue: 504000,
      },
    };
  }

  return null;
}
