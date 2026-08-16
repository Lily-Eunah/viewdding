import Link from "next/link";

interface MagazineCardItem {
  id: string;
  categoryNumber: string;
  englishTitle: string;
  koreanTitle: string;
  badge: string;
  summary: string;
  description: string;
  href: string;
  imageSrc: string;
  tag: string;
}

const MAGAZINE_CARDS: MagazineCardItem[] = [
  {
    id: "wedding-hall",
    categoryNumber: "01",
    englishTitle: "Wedding Hall Archive",
    koreanTitle: "전국 웨딩홀 탐색 & 엑셀",
    badge: "엑셀 다운로드 지원",
    summary: "서울 및 수도권 300+ 웨딩홀",
    description: "보증인원, 식대, 홀 스타일, 주차까지 한눈에 비교하고 엑셀로 한 번에 다운로드하세요.",
    href: "/search/",
    imageSrc: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
    tag: "#웨딩홀조건검색",
  },
  {
    id: "dining-gathering",
    categoryNumber: "02",
    englishTitle: "Gathering & Dining",
    koreanTitle: "청첩장 모임 & 상견례",
    badge: "프라이빗 룸 필터",
    summary: "실패 없는 다이닝 큐레이션",
    description: "예산대, 코스 구성, 룸 완비 여부, 주차 편리성을 고려해 까다로운 모임 장소를 빠르게 결정하세요.",
    href: "/gatherings/?purpose=invitation",
    imageSrc: "https://t1.daumcdn.net/local/kakaomapPhoto/review/6739c1b8888a6e6da90fd08704beb13d55823f74?original",
    tag: "#상견례룸식당",
  },
  {
    id: "self-snap",
    categoryNumber: "03",
    englishTitle: "Self Snap & Style",
    koreanTitle: "셀프스냅 룩북 & 스팟",
    badge: "스타일링 큐레이션",
    summary: "취향별 드레스 & 감성 스튜디오",
    description: "인스타그램에서 찾던 감성 스냅 드레스와 렌탈 스튜디오, 야외 촬영 스팟을 모아보세요.",
    href: "/self-snap/",
    imageSrc: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800&auto=format&fit=crop&q=80",
    tag: "#스냅원피스",
  },
  {
    id: "essentials",
    categoryNumber: "04",
    englishTitle: "Wedding Essentials",
    koreanTitle: "D-Day 결혼 준비물",
    badge: "체크리스트 & 샵",
    summary: "투어·스냅·본식 필수템",
    description: "골반 보정 속옷, 누브라, 숏베일부터 당일 멘붕 방지 파우치까지 선배 신부들이 검증한 아이템.",
    href: "/essentials/",
    imageSrc: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
    tag: "#본식필수준비물",
  },
  {
    id: "personal-color",
    categoryNumber: "05",
    englishTitle: "Personal Color & Styling",
    koreanTitle: "웨딩 퍼스널 컬러",
    badge: "신부·신랑 맞춤 진단",
    summary: "톤에 맞는 드레스 & 예복 매칭",
    description: "나에게 어울리는 화이트 톤(웜/쿨), 네크라인, 헤어메이크업 시안을 전문 스튜디오에서 진단받으세요.",
    href: "/wedding-color/",
    imageSrc: "https://t1.kakaocdn.net/fiy_reboot/place/82E1782D8809464EBB5E551610F64A0F",
    tag: "#드레스톤진단",
  },
];

export function MainMagazineCards() {
  return (
    <section className="main-magazine-section" aria-labelledby="main-solutions-heading">
      <div className="main-section-header">
        <span className="main-section-kicker">CURATED DIRECTORY</span>
        <h2 id="main-solutions-heading" className="main-section-title">
          결혼 준비의 모든 발품을 하나의 아카이브로
        </h2>
        <p className="main-section-subtitle">
          인스타그램과 네이버 카페를 헤매지 마세요. 신랑·신부에게 꼭 필요한 5가지 핵심 도구를 준비했습니다.
        </p>
      </div>

      <div className="magazine-grid magazine-grid-5">
        {MAGAZINE_CARDS.map((card) => (
          <Link key={card.id} href={card.href} className="magazine-card-link" aria-label={`${card.koreanTitle} 바로가기`}>
            <article className="magazine-card">
              <div className="magazine-card-media">
                <img
                  src={card.imageSrc}
                  alt={card.koreanTitle}
                  className="magazine-card-img"
                  loading="lazy"
                />
                <span className="magazine-card-badge">{card.badge}</span>
                <span className="magazine-card-num">{card.categoryNumber}</span>
              </div>
              <div className="magazine-card-body">
                <span className="magazine-card-tag">{card.tag}</span>
                <h3 className="magazine-card-title">
                  <span className="magazine-card-en">{card.englishTitle}</span>
                  <span className="magazine-card-ko">{card.koreanTitle}</span>
                </h3>
                <p className="magazine-card-desc">{card.description}</p>
                <div className="magazine-card-action">
                  <span>자세히 보기</span>
                  <span className="magazine-card-arrow" aria-hidden="true">→</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
