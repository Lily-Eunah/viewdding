import type { Metadata } from "next";
import Link from "next/link";
import { SearchExperience } from "@/components/SearchExperience";

export const metadata: Metadata = {
  title: "수도권 웨딩홀 검색",
  description: "서울·경기·인천 웨딩홀을 여러 시·도와 시·군·구, 홀 타입과 예식 조건별로 검색해 보세요.",
  alternates: { canonical: "/search/" },
};

export default function SearchPage() {
  return <><section className="finder-intro"><div><p className="eyebrow">VIEWDDING · SEOUL METRO AREA</p><h1>WEDDING VENUE</h1><p><strong>수도권 웨딩홀 찾기</strong><br />서울·경기·인천의 시·도와 시·군·구를 여러 곳 골라 함께 비교해 보세요.<br /><Link className="finder-seo-link" href="/seoul/wedding-halls/">서울 전체 리스트</Link> · <Link className="finder-seo-link" href="/gyeonggi/wedding-halls/">경기 전체 리스트</Link> · 인천 웨딩홀 포함</p></div></section><SearchExperience compact kakaoMapAppKey={process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY ?? ""} /></>;
}
