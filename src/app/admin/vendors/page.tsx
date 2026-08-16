import Link from "next/link";
import { getAnalyticsSummary } from "@/lib/analytics-store";

export default async function AdminVendorsPage() {
  const summary = await getAnalyticsSummary(30);
  const { topVendors } = summary;

  return (
    <div>
      <div className="admin-overview-header">
        <div>
          <h1 className="admin-title-main">전체 벤더 성과 & B2B 피칭 리포트</h1>
          <p className="admin-subtitle">
            각 입점/등록 업체별 아웃바운드 전환 데이터 및 광고주 미팅용 1-Page 성과표를 열람할 수 있습니다.
          </p>
        </div>
        <div className="admin-actions-group">
          <Link href="/admin" className="admin-btn admin-btn-secondary">
            ← 종합 대시보드
          </Link>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">
          <span>등록 벤더 목록 ({topVendors.length}개)</span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>업체명</th>
                <th>카테고리</th>
                <th>지역</th>
                <th>노출수</th>
                <th>상세 조회수</th>
                <th>네이버/카카오/인스타 이동</th>
                <th>전환율</th>
                <th>광고 상태</th>
                <th>피칭 리포트</th>
              </tr>
            </thead>
            <tbody>
              {topVendors.map((vendor, idx) => (
                <tr key={vendor.vendorId}>
                  <td style={{ fontWeight: 700, color: idx < 3 ? "#f59e0b" : "#94a3b8" }}>
                    #{idx + 1}
                  </td>
                  <td>
                    <div className="vendor-cell-title">
                      <span>{vendor.vendorName}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      {vendor.category === "gathering_restaurant"
                        ? "상견례 식당"
                        : vendor.category === "wedding_hall"
                        ? "웨딩홀"
                        : vendor.category === "hair_makeup"
                        ? "헤어변형"
                        : vendor.category === "second_dress"
                        ? "2부드레스"
                        : vendor.category === "personal_color"
                        ? "퍼스널컬러"
                        : vendor.category === "groom_suit"
                        ? "예복샵"
                        : "축의대"}
                    </span>
                  </td>
                  <td>{vendor.region}</td>
                  <td>{vendor.metrics.impressions.toLocaleString()}</td>
                  <td>{vendor.metrics.detailViews.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: "#34d399" }}>
                    {vendor.metrics.outboundClicks.toLocaleString()} 건
                  </td>
                  <td>{vendor.metrics.outboundConversionRate}%</td>
                  <td>
                    {vendor.isSponsored ? (
                      <span className="sponsored-pill">스폰서 (광고중)</span>
                    ) : (
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>일반 노출</span>
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/admin/vendors/${vendor.vendorId}`}
                      className="pitch-btn"
                    >
                      📄 피칭 리포트 열기
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
