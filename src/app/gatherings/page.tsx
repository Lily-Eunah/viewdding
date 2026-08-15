import type { Metadata } from "next";
import { Suspense } from "react";
import { RestaurantSearchExperience } from "@/components/RestaurantSearchExperience";
import { restaurants } from "@/lib/restaurants";

export const metadata: Metadata = {
  title: "청첩장 모임·상견례 장소 찾기",
  description: "전국 청첩장 모임과 상견례 음식점을 지역, 방문 요일, 가격, 룸, 코스와 주차 조건으로 찾아보세요.",
};

export default function GatheringsPage() {
  return (
    <Suspense fallback={<div className="search-loading-fallback">장소를 불러오는 중...</div>}>
      <RestaurantSearchExperience
        restaurants={restaurants}
        kakaoMapAppKey={process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY ?? ""}
      />
    </Suspense>
  );
}
