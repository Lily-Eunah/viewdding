"use client";

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
import { exportToExcel } from "@/lib/excel-export";

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
      <section className="seo-clean-hero">
        <div className="seo-hero-top">
          <p className="eyebrow">{config.eyebrow}</p>
          <h1>{config.heading}</h1>
          <div className="seo-hero-summary">
            <strong>{venueCount}개 예식장 · {collection.length}개 개별홀</strong>
            <span>지역과 인원, 예식 조건을 한눈에 비교해보세요</span>
          </div>
        </div>

        {/* Theme Category Chips */}
        <nav className="seo-theme-chips" aria-label="서울 웨딩홀 유형별 목록">
          {HALL_SEO_COLLECTION_ORDER.map((key) => {
            const relatedConfig = getHallSeoConfig(key);
            const isActive = key === collectionKey;
            return (
              <Link
                key={key}
                href={hallSeoPath(key)}
                className={`seo-chip${isActive ? " is-active" : ""}`}
              >
                {relatedConfig.titleLabel}
              </Link>
            );
          })}
        </nav>
      </section>

      <section className="results-heading" aria-labelledby="collection-results">
        <div className="result-summary-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "16px" }}>
          <div className="result-summary">
            <strong id="collection-results">{collection.length}개 개별홀</strong>
            <span>최근 확인 {displayDate(updatedAt)} 기준</span>
          </div>
          <a
            href={`/exports/${config.csvFileName}`}
            download
            className="excel-download-btn"
          >
            📊 이 테마 웨딩홀 리스트 엑셀로 다운로드
          </a>
        </div>
      </section>
      <div className="result-list">
        {collection.map((hall) => <HallCard key={hall.id} hall={hall} />)}
      </div>
    </article>
  );
}
