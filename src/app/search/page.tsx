import type { Metadata } from "next";
import { SearchExperience } from "@/components/SearchExperience";

export const metadata: Metadata = {
  title: "웨딩홀 모아보기 및 검색",
  description: "전국 주요 지역 웨딩홀 큐레이션 추천과 시도·시군구 및 예식 조건별 실시간 검색을 이용해 보세요.",
  alternates: { canonical: "/search/" },
};

export default function SearchPage() {
  return (
    <SearchExperience compact kakaoMapAppKey={process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY ?? ""} />
  );
}
