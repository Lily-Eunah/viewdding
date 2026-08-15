import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllVendorIds, getVendorPerformanceSummary } from "@/lib/analytics-store";
import { PitchDeckSimulator, PrintReportButton } from "@/components/PitchDeckSimulator";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllVendorIds().map((id) => ({ id }));
}

export default async function VendorPitchDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = await getVendorPerformanceSummary(id);

  if (!vendor) notFound();

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>
      {/* Top Navigation & Action Bar */}
      <div className="admin-overview-header no-print" style={{ marginBottom: "20px" }}>
        <Link href="/admin/vendors" className="admin-btn admin-btn-secondary">
          ← 벤더 목록으로 돌아가기
        </Link>
        <div className="admin-actions-group">
          <PrintReportButton />
        </div>
      </div>

      {/* 1-Page Pitch Deck Card Container */}
      <div className="pitch-deck-container">
        {/* Header */}
        <div className="pitch-deck-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span className="admin-badge">B2B Verified Performance Report</span>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>기준: 최근 30일 실측 데이터</span>
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 6px 0", color: "#ffffff" }}>
              {vendor.vendorName}
            </h1>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.95rem" }}>
              {vendor.region} · {vendor.category === "gathering_restaurant" ? "상견례 및 모임 전문점" : "웨딩 버티컬 벤더"}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ec4899", letterSpacing: "-0.5px" }}>
              Viewdding
            </div>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Wedding Venue & Vendor Archive</span>
          </div>
        </div>

        {/* Big Highlight: Outbound High-Intent Leads */}
        <div className="pitch-kpi-highlight">
          <div className="pitch-kpi-title">
            지난 30일간 뷰딩을 통해 <strong>네이버 지도 / 카카오맵 / 인스타그램</strong>으로 넘어간 진성 고객
          </div>
          <div className="pitch-kpi-number">
            {vendor.metrics.outboundClicks.toLocaleString()} <span style={{ fontSize: "1.5rem" }}>건</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "#cbd5e1" }}>
            동일 카테고리 내 상위 <strong>{vendor.categoryRank.percentile}%</strong>에 해당하는 높은 전환 성과를 기록하고 있습니다.
          </p>
        </div>

        {/* 3 Metrics Detail */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
          <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "18px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#94a3b8" }}>카드 노출 횟수</p>
            <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#f8fafc" }}>
              {vendor.metrics.impressions.toLocaleString()} <span style={{ fontSize: "0.9rem" }}>회</span>
            </p>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>검색 및 지도 목록 노출</span>
          </div>

          <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "18px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#94a3b8" }}>상세 조회 (관심 고객)</p>
            <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#f8fafc" }}>
              {vendor.metrics.detailViews.toLocaleString()} <span style={{ fontSize: "0.9rem" }}>회</span>
            </p>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>클릭률(CTR) {vendor.metrics.ctr}%</span>
          </div>

          <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "18px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#94a3b8" }}>창출된 잠재 광고 가치</p>
            <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#34d399" }}>
              {(vendor.metrics.estimatedMediaValue).toLocaleString()} <span style={{ fontSize: "0.9rem" }}>원</span>
            </p>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>인스타/네이버 광고비 환산</span>
          </div>
        </div>

        {/* Channel Outbound Breakdown */}
        <div style={{ background: "rgba(30, 41, 59, 0.4)", borderRadius: "12px", padding: "20px", marginBottom: "28px" }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: "1rem", color: "#e2e8f0" }}>
            고객 유출입 상세 채널 분석
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <div style={{ background: "rgba(15, 23, 42, 0.8)", padding: "14px", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.78rem", color: "#94a3b8" }}>네이버 지도(플레이스)</p>
              <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#38bdf8" }}>
                {vendor.outboundBreakdown.naverMap} <span style={{ fontSize: "0.8rem" }}>건</span>
              </p>
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.8)", padding: "14px", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.78rem", color: "#94a3b8" }}>카카오맵</p>
              <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#facc15" }}>
                {vendor.outboundBreakdown.kakaoMap} <span style={{ fontSize: "0.8rem" }}>건</span>
              </p>
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.8)", padding: "14px", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.78rem", color: "#94a3b8" }}>인스타그램 프로필</p>
              <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#ec4899" }}>
                {vendor.outboundBreakdown.instagram} <span style={{ fontSize: "0.8rem" }}>건</span>
              </p>
            </div>
          </div>
        </div>

        {/* Sponsorship Simulation & ROI Proposal Card */}
        <PitchDeckSimulator
          currentLeads={vendor.metrics.outboundClicks}
          defaultFee={300000}
        />

        {/* Footer Note */}
        <div style={{ marginTop: "28px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "#64748b" }}>
          <span>보고서 발행처: 뷰딩 (Viewdding Business Team)</span>
          <span>문의 및 광고 집행 제휴: contact@viewdding.com</span>
        </div>
      </div>
    </div>
  );
}
