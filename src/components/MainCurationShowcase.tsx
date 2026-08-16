import Link from "next/link";

interface CuratedProduct {
  id: string;
  title: string;
  brand: string;
  priceText: string;
  categoryBadge: string;
  imageUrl: string;
  linkUrl: string;
  editorNote: string;
}

const FEATURED_PRODUCTS: CuratedProduct[] = [
  {
    id: "snap-silk-slip-dress",
    title: "미니멀 실크 맥시 슬립 드레스",
    brand: "아보아보 (AVOUAVOU)",
    priceText: "189,000원",
    categoryBadge: "셀프스냅 드레스",
    imageUrl: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600&auto=format&fit=crop&q=80",
    linkUrl: "/self-snap/",
    editorNote: "자연광 아래 은은한 윤광으로 야외 스냅에서 인생샷을 완성하는 실크 슬립",
  },
  {
    id: "ess-dorosiwa-pelvis",
    title: "도로시와 골반 볼륨업 심리스 팬티",
    brand: "도로시와 (DOROSIWA)",
    priceText: "19,800원",
    categoryBadge: "드레스투어 필수",
    imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop&q=80",
    linkUrl: "/essentials/",
    editorNote: "머메이드 드레스 라인의 드라마틱한 골반 굴곡을 완성해주는 필수 보정 속옷",
  },
  {
    id: "snap-ribbon-short-veil",
    title: "프렌치 리본 숏베일 & 헤어핀 세트",
    brand: "베일리스튜디오",
    priceText: "28,000원",
    categoryBadge: "스냅 소품",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
    linkUrl: "/self-snap/",
    editorNote: "반묶음 머리에 꽂아주면 3초 만에 키치하고 로맨틱한 분위기를 연출하는 베일",
  },
  {
    id: "ess-anvely-bra",
    title: "앙블리 4cm 볼륨업 코르셋 누브라",
    brand: "앙블리 (Anvely)",
    priceText: "16,900원",
    categoryBadge: "본식·피팅 필수",
    imageUrl: "https://shop-phinf.pstatic.net/20240417_193/1713337968508f7Nve_JPEG/4375000000000000_1578330752.jpg",
    linkUrl: "/essentials/",
    editorNote: "오프숄더 및 브이넥 드레스 피팅 시 흘러내림 없는 초밀착 볼륨업",
  },
];

interface CuratedSpace {
  id: string;
  name: string;
  category: string;
  location: string;
  tag: string;
  desc: string;
  imageUrl: string;
  href: string;
}

const FEATURED_SPACES: CuratedSpace[] = [
  {
    id: "space-kyungbokgung",
    name: "경복궁 (관훈점)",
    category: "상견례 정갈한 한정식 코스",
    location: "서울 종로구 인사동",
    tag: "단독 프라이빗 룸 · 정갈한 코스",
    desc: "양가 부모님 모두 만족하시는 격조 높은 한정식 코스와 정성스러운 서비스",
    imageUrl: "https://t1.kakaocdn.net/one/store/20250225054316-42dc92ce-f556-431e-b555-4ccdecd0b29d",
    href: "/gatherings/?purpose=family_meeting",
  },
  {
    id: "space-personal-color",
    name: "몽끄컬러랩 (압구정점)",
    category: "웨딩 퍼스널 컬러 진단",
    location: "서울 강남구 신사동",
    tag: "드레스 화이트톤 · 예복 매칭",
    desc: "단순 톤 진단을 넘어 본식 드레스 라인과 메이크업 컬러 시안까지 제안",
    imageUrl: "https://t1.kakaocdn.net/fiy_reboot/place/82E1782D8809464EBB5E551610F64A0F",
    href: "/wedding-color/",
  },
  {
    id: "space-modam",
    name: "모담다이닝 (광화문점)",
    category: "상견례 모던 한정식",
    location: "서울 종로구 광화문",
    tag: "채광 좋은 룸 · 주차 완비",
    desc: "깔끔하고 세련된 모던 한정식으로 부담 없이 편안한 분위기를 연출하는 룸 다이닝",
    imageUrl: "https://t1.daumcdn.net/local/kakaomapPhoto/review/6739c1b8888a6e6da90fd08704beb13d55823f74?original",
    href: "/gatherings/?purpose=family_meeting",
  },
];

export function MainCurationShowcase() {
  return (
    <div className="main-curation-container">
      {/* 1. 어필리에이트 샵 큐레이션 (스냅의상 & 준비물) */}
      <section className="main-showcase-section" aria-labelledby="showcase-shop-heading">
        <div className="main-section-header-compact">
          <div>
            <span className="main-section-kicker">EDITOR&apos;S CURATION</span>
            <h2 id="showcase-shop-heading" className="main-compact-title">
              예비부부 90%가 찾는 촬영 의상 &amp; 필수 준비물
            </h2>
          </div>
          <div className="main-compact-links">
            <Link href="/self-snap/" className="main-text-cta">셀프스냅 룩북 전체보기 →</Link>
            <Link href="/essentials/" className="main-text-cta">D-Day 준비물 전체보기 →</Link>
          </div>
        </div>

        <div className="showcase-product-grid">
          {FEATURED_PRODUCTS.map((product) => (
            <Link key={product.id} href={product.linkUrl} className="showcase-product-card">
              <div className="showcase-product-media">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="showcase-product-img"
                  loading="lazy"
                />
                <span className="showcase-category-pill">{product.categoryBadge}</span>
              </div>
              <div className="showcase-product-info">
                <span className="showcase-product-brand">{product.brand}</span>
                <h3 className="showcase-product-title">{product.title}</h3>
                <p className="showcase-product-note">{product.editorNote}</p>
                <div className="showcase-product-price-row">
                  <span className="showcase-product-price">{product.priceText}</span>
                  <span className="showcase-product-action">보러가기 →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. 제휴/추천 장소 & 스튜디오 (실제 데이터셋 사진 연동) */}
      <section className="main-showcase-section" aria-labelledby="showcase-space-heading">
        <div className="main-section-header-compact">
          <div>
            <span className="main-section-kicker">CURATED SPACES</span>
            <h2 id="showcase-space-heading" className="main-compact-title">
              검증된 상견례 다이닝 &amp; 웨딩 전문 스튜디오
            </h2>
          </div>
          <Link href="/gatherings/?purpose=family_meeting" className="main-text-cta">
            상견례 장소 탐색하기 →
          </Link>
        </div>

        <div className="showcase-spaces-grid">
          {FEATURED_SPACES.map((space) => (
            <Link key={space.id} href={space.href} className="showcase-space-card">
              <div className="showcase-space-media">
                <img
                  src={space.imageUrl}
                  alt={space.name}
                  className="showcase-space-img"
                  loading="lazy"
                />
                <span className="showcase-space-badge">{space.category}</span>
              </div>
              <div className="showcase-space-info">
                <div className="showcase-space-meta">
                  <span className="showcase-space-loc">{space.location}</span>
                  <span className="showcase-space-tag">{space.tag}</span>
                </div>
                <h3 className="showcase-space-name">{space.name}</h3>
                <p className="showcase-space-desc">{space.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. 웨딩홀 엑셀 리스트 다운로드 유도 배너 */}
      <section className="main-excel-banner-section" aria-label="웨딩홀 엑셀 다운로드 안내">
        <div className="main-excel-banner-card">
          <div className="main-excel-banner-content">
            <span className="main-excel-kicker">FREE WEDDING DATA</span>
            <h2 className="main-excel-title">
              서울·수도권 300+ 웨딩홀 정리 엑셀 리스트
            </h2>
            <p className="main-excel-desc">
              홀 스타일, 보증인원, 식대, 주차 대수, 지하철역 도보 시간까지 정리된 엑셀 데이터를 조건별로 필터링하고 즉시 다운로드하세요.
            </p>
            <div className="main-excel-actions">
              <Link href="/search/" className="main-excel-btn-primary">
                웨딩홀 조건 탐색 &amp; 엑셀 받기
              </Link>
              <Link href="/gatherings/?purpose=invitation" className="main-excel-btn-secondary">
                청첩장 모임 식당 찾기
              </Link>
            </div>
          </div>
          <div className="main-excel-banner-badge-art" aria-hidden="true">
            <div className="main-excel-sheet-mockup">
              <div className="mockup-row header-row">
                <span>웨딩홀명</span>
                <span>지역</span>
                <span>홀스타일</span>
                <span>보증인원</span>
              </div>
              <div className="mockup-row">
                <span>라움아트센터</span>
                <span>강남구</span>
                <span>채플/가든</span>
                <span>300명</span>
              </div>
              <div className="mockup-row">
                <span>더채플앳청담</span>
                <span>강남구</span>
                <span>채플</span>
                <span>250명</span>
              </div>
              <div className="mockup-row">
                <span>빌라드지디 수서</span>
                <span>강남구</span>
                <span>하우스</span>
                <span>200명</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
