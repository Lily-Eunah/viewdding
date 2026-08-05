import type { Metadata } from "next";
import { RestaurantSearchExperience } from "@/components/RestaurantSearchExperience";
import { restaurants } from "@/lib/restaurants";

export const metadata: Metadata = {
  title: "청첩장 모임·상견례 장소 찾기",
  description: "서울 청첩장 모임과 상견례 음식점을 지역, 방문 요일, 가격, 룸, 코스와 주차 조건으로 찾아보세요.",
};

export default function GatheringsPage() {
  return (
    <>
      <section className="finder-intro gathering-hero">
        <div>
          <p className="eyebrow">WEDDING GATHERING FINDER</p>
          <h1>모임의 성격에 맞는<br />장소 찾기</h1>
          <p>청첩장 모임과 상견례를 나누어 보고,<br />요일과 인원, 공간 조건에 맞는 장소를 찾아보세요.</p>
        </div>
      </section>
      <RestaurantSearchExperience restaurants={restaurants} />
    </>
  );
}
