import type { RestaurantRecord } from "@/domain/restaurant-types";

export interface RestaurantBrandFallback {
  icon: string;
  categoryLabel: string;
  bgGradient: string;
}

export function getRestaurantBrandFallback(restaurant: RestaurantRecord): RestaurantBrandFallback {
  const cuisinesStr = (restaurant.cuisines || []).join(" ");
  const venueTypeStr = restaurant.venueType || "";
  const combined = `${cuisinesStr} ${venueTypeStr}`.toLowerCase();

  if (restaurant.purpose === "family_meeting") {
    return {
      icon: "🥂",
      categoryLabel: "상견례 프라이빗 룸",
      bgGradient: "linear-gradient(135deg, #F6F1EA 0%, #E7DDCF 100%)",
    };
  }

  if (combined.includes("한식") || combined.includes("한정식") || combined.includes("갈비") || combined.includes("한우") || combined.includes("솥밥") || combined.includes("보리굴비") || combined.includes("게장")) {
    return {
      icon: "🍚",
      categoryLabel: "정갈한 한식 코스",
      bgGradient: "linear-gradient(135deg, #F8F4EE 0%, #E5DACB 100%)",
    };
  }

  if (combined.includes("일식") || combined.includes("오마카세") || combined.includes("스시") || combined.includes("사시미") || combined.includes("가이세키") || combined.includes("이자카야")) {
    return {
      icon: "🍣",
      categoryLabel: "프라이빗 일식 다이닝",
      bgGradient: "linear-gradient(135deg, #F5F0E8 0%, #E1D6C5 100%)",
    };
  }

  if (combined.includes("양식") || combined.includes("스테이크") || combined.includes("이탈리") || combined.includes("프렌치") || combined.includes("파스타") || combined.includes("비스트로") || combined.includes("와인")) {
    return {
      icon: "🍷",
      categoryLabel: "파인다이닝 양식 코스",
      bgGradient: "linear-gradient(135deg, #F7F1EA 0%, #E3D4C4 100%)",
    };
  }

  if (combined.includes("중식") || combined.includes("중국") || combined.includes("딤섬") || combined.includes("광동") || combined.includes("마라") || combined.includes("탕수육")) {
    return {
      icon: "🥢",
      categoryLabel: "프리미엄 중식 다이닝",
      bgGradient: "linear-gradient(135deg, #F6EFE6 0%, #E6D8C8 100%)",
    };
  }

  if (combined.includes("카페") || combined.includes("디저트") || combined.includes("브런치")) {
    return {
      icon: "☕",
      categoryLabel: "감성 브런치 & 카페",
      bgGradient: "linear-gradient(135deg, #F8F3EC 0%, #E4D7C7 100%)",
    };
  }

  return {
    icon: "🍽️",
    categoryLabel: "프라이빗 모임 공간",
    bgGradient: "linear-gradient(135deg, #F6F1EA 0%, #E6DEC3 100%)",
  };
}
