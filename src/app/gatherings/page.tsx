import type { Metadata } from "next";
import { RestaurantSearchExperience } from "@/components/RestaurantSearchExperience";
import { metadata as restaurantMetadata, restaurants } from "@/lib/restaurants";

export const metadata: Metadata = {
  title: "청첩장 모임·상견례 장소 찾기",
  description: "서울 청첩장 모임과 상견례 음식점을 지역, 방문 요일, 가격, 룸, 코스와 주차 조건으로 찾아보세요.",
};

export default function GatheringsPage() {
  return (
    <>
      <section className="gathering-hero">
        <p className="eyebrow">WEDDING GATHERING FINDER</p>
        <h1>모임의 성격에 맞는 장소를<br />조건으로 찾아보세요.</h1>
        <p>청첩장 모임과 상견례를 나누어 보고, 선택한 요일에 정기 휴무인 음식점은 검색 결과에서 제외합니다.</p>
        <div className="data-status">활성 음식점 {restaurantMetadata.exportedRestaurants}곳 · Google Sheet 기준</div>
      </section>
      <RestaurantSearchExperience restaurants={restaurants} />
    </>
  );
}
