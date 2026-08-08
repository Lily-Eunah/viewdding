import type { Metadata } from "next";
import Link from "next/link";
import { SearchExperience } from "@/components/SearchExperience";

export const metadata: Metadata = {
  title: "서울 웨딩홀 검색",
  description: "서울 웨딩홀을 지역, 홀 타입, 수용인원과 예식 조건별로 검색하고 지도에서 확인해 보세요.",
  alternates: { canonical: "/search/" },
};

export default function SearchPage() {
  return <><section className="finder-intro"><div><p className="eyebrow">VIEWDDING · SEOUL</p><h1>WEDDING VENUE</h1><p><strong>서울 웨딩홀 찾기</strong><br />지역과 홀 타입부터 선택하고, 필요한 조건을 더해보세요.<br /><Link className="finder-seo-link" href="/seoul/wedding-halls/">서울 웨딩홀 전체 리스트 보기</Link></p></div></section><SearchExperience compact kakaoMapAppKey={process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY ?? ""} /></>;
}
