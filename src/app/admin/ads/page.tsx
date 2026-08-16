import Link from "next/link";
import { getAnalyticsSummary } from "@/lib/analytics-store";

export default async function AdminAdsPage() {
  const summary = await getAnalyticsSummary(30);
  const { topVendors, adSlots } = summary;

  const sponsoredVendors = topVendors.filter((v) => v.isSponsored);

  return (
    <div>
      <div className="admin-overview-header">
        <div>
          <h1 className="admin-title-main">상단 고정 & 스폰서십 광고 슬롯 관리</h1>
          <p className="admin-subtitle">
            지역 및 카테고리별 최상단 파워 슬롯(월 30만 원) 집행 현황과 계약 일정을 관리합니다.
          </p>
        </div>
        <div className="admin-actions-group">
          <Link href="/admin" className="admin-btn admin-btn-secondary">
            ← 종합 대시보드
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card revenue-card">
          <div className="stat-header-row">
            <span className="stat-phase-tag">이번 달 예상 광고 매출</span>
          </div>
          <div className="stat-value-main">
            {(adSlots.estimatedMonthlyRevenue / 10000).toLocaleString()}
            <span className="stat-unit">만 원</span>
          </div>
          <div className="stat-subtext">
            <span>활성 광고 {sponsoredVendors.length}개 구좌</span>
          </div>
        </div>

        <div className="admin-stat-card top-funnel">
          <div className="stat-header-row">
            <span className="stat-phase-tag">전체 슬롯 점유율</span>
          </div>
          <div className="stat-value-main">
            {Math.round((sponsoredVendors.length / adSlots.totalSlotsCount) * 100)}
            <span className="stat-unit">%</span>
          </div>
          <div className="stat-subtext">
            <span>총 {adSlots.totalSlotsCount}개 슬롯 중 {sponsoredVendors.length}개 판매 완료</span>
          </div>
        </div>

        <div className="admin-stat-card mid-funnel">
          <div className="stat-header-row">
            <span className="stat-phase-tag">평균 스폰서십 유입 효과</span>
          </div>
          <div className="stat-value-main">
            +350
            <span className="stat-unit">%</span>
          </div>
          <div className="stat-subtext">
            <span>일반 노출 대비 아웃바운드 클릭 증가율</span>
          </div>
        </div>
      </div>

      {/* Active Slots Table */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>현재 활성 스폰서십 슬롯 목록</span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>슬롯 위치 / 타겟</th>
                <th>광고 업체명</th>
                <th>월 광고비</th>
                <th>지난 30일 리드 유입</th>
                <th>유효 단가 (eCPC)</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {sponsoredVendors.map((vendor) => (
                <tr key={vendor.vendorId}>
                  <td>
                    <strong style={{ color: "#e2e8f0" }}>
                      {vendor.category === "gathering_restaurant"
                        ? `[상견례 지도] ${vendor.region} 최상단 1위`
                        : vendor.category === "hair_makeup"
                        ? `[헤어변형] 추천 1위 슬롯`
                        : `[2부드레스] 청담/강남 추천 1위`}
                    </strong>
                  </td>
                  <td>
                    <div className="vendor-cell-title">
                      <span>{vendor.vendorName}</span>
                      <span className="sponsored-pill">AD</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: "#f8fafc" }}>300,000 원/월</td>
                  <td style={{ fontWeight: 700, color: "#34d399" }}>
                    {vendor.metrics.outboundClicks.toLocaleString()} 건
                  </td>
                  <td>
                    건당 {vendor.sponsorshipProjection?.effectiveCpc.toLocaleString() || 850} 원
                  </td>
                  <td>
                    <span style={{ fontSize: "0.78rem", color: "#34d399", background: "rgba(16, 185, 129, 0.1)", padding: "3px 8px", borderRadius: "999px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                      집행 중 (정상)
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/admin/vendors/${vendor.vendorId}`}
                      className="pitch-btn"
                    >
                      성과 리포트 확인
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
