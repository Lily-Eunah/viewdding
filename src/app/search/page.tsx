import type { Metadata } from "next";
import { SearchExperience } from "@/components/SearchExperience";

export const metadata: Metadata = { title: "서울 웨딩홀 검색" };

export default function SearchPage() {
  return <><section className="page-intro"><p className="eyebrow">WEDDING VENUE SEARCH</p><h1>서울 웨딩홀 찾기</h1><p>지역과 웨딩홀 타입부터 선택하고, 필요한 경우 상세 조건을 추가하세요.</p></section><SearchExperience compact /></>;
}
