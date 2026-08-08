import type { Metadata } from "next";
import Link from "next/link";
import { HallCard } from "@/components/HallCard";
import { gyeonggiHalls, metadata as hallMetadata } from "@/lib/data";
import { collectionUpdatedAt, collectionVenueCount } from "@/lib/hall-seo";

const BASE_URL = "https://viewdding.com";
const collection = gyeonggiHalls.toSorted((left, right) => (
  left.district.localeCompare(right.district, "ko")
  || left.venueName.localeCompare(right.venueName, "ko")
  || left.hallName.localeCompare(right.hallName, "ko")
));
const venueCount = collectionVenueCount(collection);
const updatedAt = collectionUpdatedAt(collection, hallMetadata.generatedAt);
const title = `경기도 웨딩홀 리스트 ${collection.length}개`;
const description = `경기도 ${venueCount}개 예식장의 ${collection.length}개 개별홀을 지역, 홀 타입, 수용인원과 예식간격별로 비교해 보세요.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/gyeonggi/wedding-halls/" },
  openGraph: {
    type: "website",
    url: "/gyeonggi/wedding-halls/",
    title,
    description,
    images: [{ url: "/viewdding-hero-v48.png", alt: "Viewdding 경기도 웨딩홀 리스트" }],
  },
};

export default function GyeonggiWeddingHallsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${BASE_URL}/gyeonggi/wedding-halls/#collection`,
        url: `${BASE_URL}/gyeonggi/wedding-halls/`,
        name: title,
        description,
        dateModified: updatedAt,
        inLanguage: "ko-KR",
      },
      {
        "@type": "ItemList",
        "@id": `${BASE_URL}/gyeonggi/wedding-halls/#list`,
        name: title,
        numberOfItems: collection.length,
        itemListElement: collection.map((hall, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${hall.venueName} ${hall.hallName}`,
          url: `${BASE_URL}/halls/${hall.id}/`,
        })),
      },
    ],
  };

  return (
    <article className="seo-collection-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }}
      />
      <nav className="breadcrumb" aria-label="현재 위치"><Link href="/">홈</Link><span aria-hidden="true">/</span><span>경기도 웨딩홀</span></nav>
      <section className="finder-intro seo-collection-hero">
        <div>
          <p className="eyebrow">VIEWDDING · GYEONGGI WEDDING HALLS</p>
          <h1>경기도 웨딩홀 리스트</h1>
          <p><strong>{venueCount}개 예식장 · {collection.length}개 개별홀</strong><br />최근 운영과 홀 구성이 확인된 곳만 모았습니다.</p>
        </div>
      </section>
      <section className="seo-collection-copy" aria-labelledby="gyeonggi-definition">
        <h2 id="gyeonggi-definition">경기도 웨딩홀을 개별홀 기준으로 정리했어요</h2>
        <p>같은 예식장 안의 서로 다른 홀을 개별홀로 나누고, 지역과 분위기, 수용인원, 예식간격과 식사 정보를 함께 비교할 수 있게 정리했습니다.</p>
        <p>최근 운영이나 실제 예식 흔적을 확인하지 못한 업체는 공개 목록에서 제외했습니다.</p>
        <p className="source-summary">최근 확인 {updatedAt.replaceAll("-", ".")} · 개별홀 기준</p>
        <div className="source-links"><Link className="primary-link" href="/search/">상세 조건으로 찾기</Link><Link href="/methodology/">분류 기준 보기</Link></div>
      </section>
      <section className="results-heading" aria-labelledby="gyeonggi-results">
        <div className="result-summary"><strong id="gyeonggi-results">{collection.length}개 개별홀</strong><span>확인된 정보가 많은 홀부터 비교하고, 상세 페이지에서 출처와 확인일을 확인하세요.</span></div>
      </section>
      <div className="result-list">{collection.map((hall) => <HallCard key={hall.id} hall={hall} />)}</div>
    </article>
  );
}
