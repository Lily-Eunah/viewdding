import Link from "next/link";
import { HallCard } from "@/components/HallCard";
import { metadata, seoulHalls } from "@/lib/data";
import {
  collectionHalls,
  collectionUpdatedAt,
  collectionVenueCount,
  getHallSeoConfig,
  HALL_SEO_COLLECTION_ORDER,
  hallSeoPath,
  hallSeoSearchHref,
  type HallSeoCollectionKey,
} from "@/lib/hall-seo";

const BASE_URL = "https://viewdding.com";
function displayDate(value: string): string {
  return value.replaceAll("-", ".");
}

export function HallSeoCollection({ collectionKey }: { collectionKey: HallSeoCollectionKey }) {
  const config = getHallSeoConfig(collectionKey);
  const collection = collectionHalls(seoulHalls, collectionKey);
  const venueCount = collectionVenueCount(collection);
  const updatedAt = collectionUpdatedAt(collection, metadata.generatedAt);
  const canonicalPath = hallSeoPath(collectionKey);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: `${BASE_URL}/`,
        name: "Viewdding",
        inLanguage: "ko-KR",
      },
      {
        "@type": "CollectionPage",
        "@id": `${BASE_URL}${canonicalPath}#collection`,
        url: `${BASE_URL}${canonicalPath}`,
        name: config.heading,
        description: `${config.searchTerms}을 개별홀 기준으로 비교하는 목록입니다.`,
        dateModified: updatedAt,
        inLanguage: "ko-KR",
        isPartOf: { "@id": `${BASE_URL}/#website` },
        mainEntity: { "@id": `${BASE_URL}${canonicalPath}#list` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Viewdding", item: `${BASE_URL}/` },
          { "@type": "ListItem", position: 2, name: "서울 웨딩홀", item: `${BASE_URL}/seoul/wedding-halls/` },
          ...(collectionKey === "all"
            ? []
            : [{ "@type": "ListItem", position: 3, name: config.heading, item: `${BASE_URL}${canonicalPath}` }]),
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${BASE_URL}${canonicalPath}#list`,
        name: config.heading,
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
      <nav className="breadcrumb" aria-label="현재 위치">
        <Link href="/">홈</Link><span aria-hidden="true">/</span>
        {collectionKey === "all" ? <span>서울 웨딩홀</span> : <><Link href="/seoul/wedding-halls/">서울 웨딩홀</Link><span aria-hidden="true">/</span><span>{config.heading}</span></>}
      </nav>
      <section className="finder-intro seo-collection-hero">
        <div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h1>{config.heading}</h1>
          <p><strong>{venueCount}개 예식장 · {collection.length}개 개별홀</strong><br />지역과 인원, 예식 조건을 한눈에 비교해 보세요.</p>
        </div>
      </section>
      <section className="seo-collection-copy" aria-labelledby="collection-definition">
        <h2 id="collection-definition">{config.definitionTitle}</h2>
        <p>{config.definition}</p>
        <p>{config.note}</p>
        <p className="source-summary">최근 확인 {displayDate(updatedAt)} · 개별홀 기준 · 유형별 목록은 서로 중복될 수 있습니다.</p>
        <div className="source-links">
          <Link className="primary-link" href={hallSeoSearchHref(collectionKey)}>상세 조건으로 찾기</Link>
          <Link href="/methodology/">분류 기준 보기</Link>
        </div>
      </section>
      <nav className="seo-related-links" aria-label="서울 웨딩홀 유형별 목록">
        {HALL_SEO_COLLECTION_ORDER.filter((key) => key !== collectionKey).map((key) => {
          const relatedConfig = getHallSeoConfig(key);
          return <Link key={key} href={hallSeoPath(key)}>{relatedConfig.heading}</Link>;
        })}
      </nav>
      <section className="results-heading" aria-labelledby="collection-results">
        <div className="result-summary">
          <strong id="collection-results">{collection.length}개 개별홀</strong>
          <span>확인된 정보가 많은 홀부터 비교하고, 상세 페이지에서 출처와 확인일을 확인하세요.</span>
        </div>
      </section>
      <div className="result-list">
        {collection.map((hall) => <HallCard key={hall.id} hall={hall} />)}
      </div>
    </article>
  );
}
