import type { Metadata } from "next";
import { SearchExperience } from "@/components/SearchExperience";

export const metadata: Metadata = { title: "서울 웨딩홀 검색" };

export default function SearchPage() {
  return <><section className="finder-intro"><div><p className="eyebrow">VIEWDDING · SEOUL</p><h1>WEDDING VENUE</h1><p><strong>서울 웨딩홀 찾기</strong><br />지역과 홀 타입부터 선택하고, 필요한 조건을 더해보세요.</p></div></section><SearchExperience compact /></>;
}
