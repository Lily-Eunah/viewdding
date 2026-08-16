import { describe, expect, it } from "vitest";
import { getAnalyticsSummary, getVendorPerformanceSummary, saveAnalyticsEvents } from "../src/lib/analytics-store";
import type { AnalyticsEventRecord } from "../src/domain/analytics-types";

describe("Analytics Store & Aggregator", () => {
  it("should return a complete analytics summary with all 3 funnel tiers", async () => {
    const summary = await getAnalyticsSummary(30);

    expect(summary).toBeDefined();
    expect(summary.topFunnel.totalPv).toBeGreaterThan(0);
    expect(summary.topFunnel.totalUv).toBeGreaterThan(0);
    expect(summary.topFunnel.categories.length).toBeGreaterThan(0);
    expect(summary.midFunnel.totalImpressions).toBeGreaterThan(0);
    expect(summary.midFunnel.totalDetailViews).toBeGreaterThan(0);
    expect(summary.bottomFunnel.totalOutboundClicks).toBeGreaterThan(0);
    expect(summary.bottomFunnel.outboundBreakdown.naverMap).toBeGreaterThan(0);
    expect(summary.topVendors.length).toBeGreaterThan(0);
  });

  it("should record outbound click events and reflect in summary", async () => {
    const mockEvent: AnalyticsEventRecord = {
      id: `test_${Date.now()}`,
      eventType: "outbound_click",
      visitorId: "test_visitor_123",
      sessionId: "test_session_123",
      pagePath: "/gatherings",
      vendorId: "test-vendor-001",
      vendorName: "테스트 상견례",
      targetType: "naver_map",
      timestamp: new Date().toISOString(),
    };

    await saveAnalyticsEvents([mockEvent]);
    const summary = await getAnalyticsSummary(30);
    expect(summary.bottomFunnel.outboundBreakdown.naverMap).toBeGreaterThan(0);
  });

  it("should return vendor performance with sponsorship projection", async () => {
    const vendorSummary = await getVendorPerformanceSummary("hair-01");
    expect(vendorSummary).toBeDefined();
    if (vendorSummary) {
      expect(vendorSummary.vendorName).toBe("블랑쉬 헤어변형");
      expect(vendorSummary.metrics.outboundClicks).toBeGreaterThan(0);
      expect(vendorSummary.sponsorshipProjection).toBeDefined();
      expect(vendorSummary.sponsorshipProjection?.projectedSponsoredLeads).toBeGreaterThan(0);
    }
  });
});
