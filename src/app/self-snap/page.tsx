import type { Metadata } from "next";
import { Suspense } from "react";
import { SelfSnapExperience } from "@/components/SelfSnapExperience";
import { getSelfSnapItems, getSelfSnapVenues } from "@/lib/self-snap";

export const metadata: Metadata = {
  title: "셀프스냅 큐레이션 | 의상·소품 쇼핑부터 자연광 스튜디오 & 야외 명소까지 | Viewdding",
  description:
    "셀프웨딩 드레스, 숏베일, 조화 부케, 촬영 소품과 서울/경기/제주 자연광 렌탈 스튜디오, 감성 호텔, 야외 노을 인생샷 명소를 둘러보세요.",
  openGraph: {
    title: "셀프스냅 큐레이션 | Viewdding",
    description:
      "셀프웨딩 드레스, 숏베일, 조화 부케, 촬영 소품과 서울/경기/제주 자연광 렌탈 스튜디오, 감성 호텔, 야외 노을 인생샷 명소를 둘러보세요.",
    url: "https://viewdding.com/self-snap",
  },
};

export default async function SelfSnapPage() {
  const [items, venues] = await Promise.all([
    getSelfSnapItems(),
    getSelfSnapVenues(),
  ]);

  return (
    <Suspense fallback={<div className="search-loading-fallback">셀프스냅 큐레이션을 불러오는 중...</div>}>
      <SelfSnapExperience initialItems={items} initialVenues={venues} />
    </Suspense>
  );
}
