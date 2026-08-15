import Link from "next/link";
import "./admin.css";

export const metadata = {
  title: "Viewdding B2B Admin & Ads",
  description: "뷰딩 B2B 파트너십, 아웃링크 전환 및 광고 성과 분석 대시보드",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand-group">
            <Link href="/" className="admin-brand-logo" aria-label="Viewdding 홈">
              <span className="admin-brand-kicker">WEDDING PLACE ARCHIVE</span>
              <span className="admin-brand-name">Viewdding</span>
            </Link>
            <span className="admin-badge">B2B Admin & Ads</span>
          </div>

          <nav className="admin-nav-links" aria-label="어드민 메뉴">
            <Link href="/admin" className="admin-nav-item">
              대시보드 종합
            </Link>
            <Link href="/admin/vendors" className="admin-nav-item">
              벤더 성과 & 피칭 리포트
            </Link>
            <Link href="/admin/ads" className="admin-nav-item">
              상단 광고 슬롯
            </Link>
            <Link href="/admin/essentials" className="admin-nav-item">
              🛍️ 준비물 관리
            </Link>
            <Link href="/admin/self-snap/items" className="admin-nav-item">
              📸 스냅 소품/의상
            </Link>
            <Link href="/admin/self-snap/venues" className="admin-nav-item">
              🏛️ 스냅 장소/스튜디오
            </Link>
          </nav>

          <div className="admin-actions-group">
            <Link href="/gatherings" className="admin-btn admin-btn-secondary" target="_blank">
              사용자 화면 보기 ↗
            </Link>
          </div>
        </div>
      </header>

      <main className="admin-body">{children}</main>
    </div>
  );
}
