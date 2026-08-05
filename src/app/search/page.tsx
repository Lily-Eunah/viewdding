import type { Metadata } from "next";
import { SearchExperience } from "@/components/SearchExperience";

export const metadata: Metadata = { title: "서울 웨딩홀 검색" };

export default function SearchPage() {
  return <><section className="finder-intro"><div><p className="eyebrow">WEDDING VENUE SEARCH</p><h1>서울 웨딩홀 찾기</h1><p>지역과 웨딩홀 타입부터 선택하고,<br />필요한 조건을 더해 나에게 맞는 홀을 찾아보세요.</p></div></section><SearchExperience compact /></>;
}
