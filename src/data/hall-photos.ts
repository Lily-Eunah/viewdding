import type { HallPhoto } from "@/domain/types";

// Only hall-identifiable images from first-party pages are public here.
// `official_source_linked` means the original file remains hosted by the venue;
// it does not imply that Viewdding owns the copyright.
export const hallPhotosByHallId: Readonly<Record<string, readonly HallPhoto[]>> = {
  "H-SEO-20260728-002": [
    {
      id: "P-H-SEO-20260728-002-01",
      url: "https://cdn.imweb.me/upload/S20200508a1f500ca054db/f990d1d98f92a.png",
      sourceUrl: "https://chungdamvilladegd.com/EspaceEmpyree",
      sourceName: "빌라드지디 청담 공식 홈페이지",
      sourceType: "official_website",
      usageStatus: "official_source_linked",
      checkedAt: "2026-08-07",
      alt: "빌라드지디 청담 에스파체 앙피레 웨딩홀 전경",
      isPrimary: true,
    },
  ],
  "H-SEO-20260728-004": [
    {
      id: "P-H-SEO-20260728-004-01",
      url: "https://www.hotelnaruseoul.com/wp-content/uploads/sites/18/2023/02/NR-MG-Naru-Ballroom-round-wall_logo-2200x1200.jpg",
      sourceUrl: "https://www.hotelnaruseoul.com/meetings-events/naru-ballroom/",
      sourceName: "호텔 나루 서울 공식 홈페이지",
      sourceType: "official_website",
      usageStatus: "official_source_linked",
      checkedAt: "2026-08-07",
      alt: "호텔 나루 서울 나루 볼룸 원형 테이블 공간 전경",
      isPrimary: true,
    },
  ],
  "H-SEO-20260728-009": [
    {
      id: "P-H-SEO-20260728-009-01",
      url: "https://www.shillahotels.com/hbcimages/260528/20260528222328_80eda37f-bc62-4405-adcb-46a3602a1f00.jpg",
      sourceUrl: "https://www.shillahotels.com/ko/theshilla/seoul/meetingEvent/event/grandballroom.do",
      sourceName: "서울신라호텔 공식 홈페이지",
      sourceType: "official_website",
      usageStatus: "official_source_linked",
      checkedAt: "2026-08-07",
      alt: "서울신라호텔 다이너스티 대연회장 전경",
      isPrimary: true,
    },
  ],
  "H-SEO-20260728-031": [
    {
      id: "P-H-SEO-20260728-031-01",
      url: "https://thecheongdam.com/wp-content/uploads/2025/06/BHK001921-1024x683.jpg",
      sourceUrl: "https://thecheongdam.com/noblesse/",
      sourceName: "더청담 공식 홈페이지",
      sourceType: "official_website",
      usageStatus: "official_source_linked",
      checkedAt: "2026-08-07",
      alt: "더청담 노블레스홀 웨딩 세팅 전경",
      isPrimary: true,
    },
  ],
  "H-SEO-20260729-105": [
    {
      id: "P-H-SEO-20260729-105-01",
      url: "https://thecheongdam.com/wp-content/uploads/2025/06/BHK00208-1-1024x683.jpg",
      sourceUrl: "https://thecheongdam.com/thedome/",
      sourceName: "더청담 공식 홈페이지",
      sourceType: "official_website",
      usageStatus: "official_source_linked",
      checkedAt: "2026-08-07",
      alt: "더청담 더 돔 가든 웨딩 공간 전경",
      isPrimary: true,
    },
  ],
};

const publicUsageStatuses = new Set<HallPhoto["usageStatus"]>([
  "official_source_linked",
  "partner_provided",
  "licensed",
]);

export function photosForHall(hallId: string): HallPhoto[] {
  return [...(hallPhotosByHallId[hallId] ?? [])]
    .filter((photo) => publicUsageStatuses.has(photo.usageStatus))
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}
