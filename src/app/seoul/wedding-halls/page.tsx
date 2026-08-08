import type { Metadata } from "next";
import { HallSeoCollection } from "@/components/HallSeoCollection";
import { seoulHalls } from "@/lib/data";
import { collectionVenueCount } from "@/lib/hall-seo";

const title = `서울 웨딩홀 리스트 ${seoulHalls.length}개`;
const description = `서울 ${collectionVenueCount(seoulHalls)}개 예식장의 ${seoulHalls.length}개 개별홀을 지역, 홀 타입, 수용인원과 예식간격별로 비교해 보세요.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/seoul/wedding-halls/" },
  openGraph: {
    type: "website",
    url: "/seoul/wedding-halls/",
    title,
    description,
    images: [{ url: "/viewdding-hero-v48.png", alt: "Viewdding 서울 웨딩홀 리스트" }],
  },
};

export default function SeoulWeddingHallsPage() {
  return <HallSeoCollection collectionKey="all" />;
}
