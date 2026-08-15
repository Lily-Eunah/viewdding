import Link from "next/link";
import { getAnalyticsSummary } from "@/lib/analytics-store";
import type { CategorySummary } from "@/domain/analytics-types";

export default async function AdminDashboardPage() {
  const summary = await getAnalyticsSummary(30);

  const { topFunnel, midFunnel, bottomFunnel, topVendors, recentOutboundEvents, adSlots } = summary;

  // Max PV for SVG bar chart scaling
  const maxPv = Math.max(...topFunnel.dailyTraffic.map((d) => d.pv), 1);

  return (
    <div>
      {/* Overview Title & Action Bar */}
      <div className="admin-overview-header">
        <div>
          <h1 className="admin-title-main">B2B 트래픽 & 파트너십 성과 대시보드</h1>
          <p className="admin-subtitle">
            최근 30일간의 진성 예비부부 유입 트래픽, 아웃링크(지도/인스타) 전환 및 광고 비즈니스 임팩트 분석
          </p>
        </div>
        <div className="admin-actions-group">
          <Link href="/admin/vendors" className="admin-btn admin-btn-primary">
            📊 광고 제안서(피칭 리포트) 생성기
          </Link>
        </div>
      </div>

      {/* 3-Tier Funnel Stat Cards Grid */}
      <div className="admin-stats-grid">
        {/* Top-Funnel */}
        <div className="admin-stat-card top-funnel">
          <div className="stat-header-row">
            <span className="stat-phase-tag">1. 유입 및 도달 (Top-Funnel)</span>
            <span className="stat-growth-badge positive">+{topFunnel.uvGrowthWoW}% WoW</span>
          </div>
          <div className="stat-value-main">
            {topFunnel.totalUv.toLocaleString()}
            <span className="stat-unit">UV</span>
          </div>
          <div className="stat-subtext">
            <span>총 페이지뷰: <strong>{topFunnel.totalPv.toLocaleString()} PV</strong></span>
            <span>MoM: +{topFunnel.uvGrowthMoM}%</span>
          </div>
        </div>

        {/* Mid-Funnel */}
        <div className="admin-stat-card mid-funnel">
          <div className="stat-header-row">
            <span className="stat-phase-tag">2. 관심 & 탐색 (Mid-Funnel)</span>
            <span className="stat-growth-badge positive">평균 CTR {midFunnel.averageCtr}%</span>
          </div>
          <div className="stat-value-main">
            {midFunnel.totalDetailViews.toLocaleString()}
            <span className="stat-unit">상세 조회</span>
          </div>
          <div className="stat-subtext">
            <span>총 카드 노출: <strong>{midFunnel.totalImpressions.toLocaleString()} 회</strong></span>
            <span>즐겨찾기: {midFunnel.totalFavorites.toLocaleString()} 회</span>
          </div>
        </div>

        {/* Bottom-Funnel - 핵심 전환 */}
        <div className="admin-stat-card bottom-funnel">
          <div className="stat-header-row">
            <span className="stat-phase-tag">3. 아웃바운드 전환 (Bottom-Funnel)</span>
            <span className="stat-growth-badge positive">전환율 {bottomFunnel.averageOutboundConversionRate}%</span>
          </div>
          <div className="stat-value-main">
            {bottomFunnel.totalOutboundClicks.toLocaleString()}
            <span className="stat-unit">리드 이동</span>
          </div>
          <div className="stat-subtext">
            <span>네이버/카카오/인스타 직접 이동 고객</span>
          </div>
        </div>

        {/* B2B Revenue & Value */}
        <div className="admin-stat-card revenue-card">
          <div className="stat-header-row">
            <span className="stat-phase-tag">4. 창출된 마케팅 가치</span>
            <span className="stat-growth-badge positive">광고 슬롯 {adSlots.activeSponsorsCount}/{adSlots.totalSlotsCount}</span>
          </div>
          <div className="stat-value-main">
            {(bottomFunnel.totalEstimatedMediaValue / 10000).toLocaleString()}
            <span className="stat-unit">만 원 상당</span>
          </div>
          <div className="stat-subtext">
            <span>인스타 스폰서 광고 단가 대비 환산액</span>
          </div>
        </div>
      </div>

      {/* Charts & Categorical Breakdown */}
      <div className="admin-charts-grid">
        {/* Left: Daily Traffic & Outbound Trend */}
        <div className="admin-card">
          <div className="admin-card-title">
            <span>일별 진성 유저 트래픽 추이 (PV / UV)</span>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>최근 30일</span>
          </div>
          <div className="traffic-chart-wrapper">
            {topFunnel.dailyTraffic.map((d) => {
              const heightPercent = Math.max(12, Math.round((d.pv / maxPv) * 100));
              return (
                <div className="chart-bar-group" key={d.date} title={`${d.date}: ${d.pv} PV (${d.uv} UV)`}>
                  <div
                    className="chart-bar pv"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="chart-bar-label">{d.date.slice(3)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Outbound Channel Share */}
        <div className="admin-card">
          <div className="admin-card-title">
            <span>외부 채널(리드) 연결 비중</span>
          </div>
          <div className="outbound-channel-grid">
            <div className="outbound-channel-box">
              <p className="outbound-channel-name">네이버 지도 (플레이스)</p>
              <p className="outbound-channel-count">{bottomFunnel.outboundBreakdown.naverMap.toLocaleString()} 건</p>
            </div>
            <div className="outbound-channel-box">
              <p className="outbound-channel-name">카카오맵</p>
              <p className="outbound-channel-count">{bottomFunnel.outboundBreakdown.kakaoMap.toLocaleString()} 건</p>
            </div>
            <div className="outbound-channel-box">
              <p className="outbound-channel-name">인스타그램 프로필</p>
              <p className="outbound-channel-count">{bottomFunnel.outboundBreakdown.instagram.toLocaleString()} 건</p>
            </div>
            <div className="outbound-channel-box">
              <p className="outbound-channel-name">블로그 후기 & 기타</p>
              <p className="outbound-channel-count">
                {(bottomFunnel.outboundBreakdown.blogReview + bottomFunnel.outboundBreakdown.phone).toLocaleString()} 건
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Demand Share */}
      <div className="admin-card" style={{ marginBottom: "28px" }}>
        <div className="admin-card-title">
          <span>웨딩 버티컬 카테고리별 유저 수요 점유율</span>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>탐색 트래픽 기준</span>
        </div>
        <div className="category-progress-list">
          {topFunnel.categories.map((cat: CategorySummary) => (
            <div className="category-progress-item" key={cat.category}>
              <div className="category-progress-label">
                <span>{cat.label} ({cat.vendorCount}개 업체)</span>
                <span>
                  <strong>{cat.sharePercentage}%</strong> ({cat.pv.toLocaleString()} PV / 리드 {cat.totalOutboundClicks.toLocaleString()}건)
                </span>
              </div>
              <div className="category-progress-bar-bg">
                <div
                  className="category-progress-bar-fill"
                  style={{ width: `${cat.sharePercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Vendors & Pitch Deck Trigger */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>인기 벤더 성과 및 광고 제안서(Pitch Report) 대상</span>
          <Link href="/admin/vendors" style={{ fontSize: "0.85rem", color: "#a78bfa", textDecoration: "none" }}>
            전체 벤더 보기 ({topVendors.length}개) →
          </Link>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>업체명 / 카테고리</th>
                <th>지역</th>
                <th>노출수 (Imp)</th>
                <th>상세 조회수</th>
                <th>아웃링크 리드 (지도/인스타)</th>
                <th>전환율</th>
                <th>추정 마케팅 가치</th>
                <th>피칭 리포트</th>
              </tr>
            </thead>
            <tbody>
              {topVendors.slice(0, 10).map((vendor, idx) => (
                <tr key={vendor.vendorId}>
                  <td style={{ fontWeight: 700, color: idx < 3 ? "#f59e0b" : "#94a3b8" }}>
                    #{idx + 1}
                  </td>
                  <td>
                    <div className="vendor-cell-title">
                      <span>{vendor.vendorName}</span>
                      {vendor.isSponsored ? <span className="sponsored-pill">AD</span> : null}
                    </div>
                  </td>
                  <td>{vendor.region}</td>
                  <td>{vendor.metrics.impressions.toLocaleString()}</td>
                  <td>{vendor.metrics.detailViews.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: "#34d399" }}>
                    {vendor.metrics.outboundClicks.toLocaleString()} 건
                  </td>
                  <td>{vendor.metrics.outboundConversionRate}%</td>
                  <td>{(vendor.metrics.estimatedMediaValue).toLocaleString()} 원</td>
                  <td>
                    <Link
                      href={`/admin/vendors/${vendor.vendorId}`}
                      className="pitch-btn"
                    >
                      📄 피칭 리포트
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
