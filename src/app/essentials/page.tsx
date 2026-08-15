import type { Metadata } from "next";
import { Suspense } from "react";
import { EssentialsExperience } from "@/components/EssentialsExperience";
import { getWeddingEssentials } from "@/lib/essentials";

export const metadata: Metadata = {
  title: "결혼 준비물 컬렉션 & 체크리스트 | Viewdding",
  description:
    "드레스 투어, 스튜디오 촬영, 본식 당일, 신혼여행까지 결혼 준비 단계별 필수 준비물과 실전 꿀팁을 확인해 보세요.",
  openGraph: {
    title: "결혼 준비물 컬렉션 & 체크리스트 | Viewdding",
    description:
      "드레스 투어, 스튜디오 촬영, 본식 당일, 신혼여행까지 결혼 준비 단계별 필수 준비물과 실전 꿀팁을 확인해 보세요.",
    url: "https://viewdding.com/essentials",
  },
};

export default async function EssentialsPage() {
  const items = await getWeddingEssentials();

  return (
    <Suspense fallback={<div className="search-loading-fallback">준비물 목록을 불러오는 중...</div>}>
      <EssentialsExperience initialItems={items} />
    </Suspense>
  );
}
