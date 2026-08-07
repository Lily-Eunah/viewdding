import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isVisitReviewEvidence, type RestaurantEvidenceRecord } from "@/domain/restaurant-evidence";
import {
  gatheringPurposeLabel,
  restaurantClosedDaysLabel,
  restaurantName,
  restaurantParkingLabel,
  restaurantPriceLabel,
  restaurantRoomLabel,
  restaurantStationLabel,
} from "@/lib/restaurant-labels";
import { restaurantSlug } from "@/lib/restaurant-routes";
import { getRestaurantBySlug, getRestaurantEvidence, restaurants } from "@/lib/restaurants";

export const dynamicParams = false;

export function generateStaticParams() {
  return restaurants.map((restaurant) => ({ id: restaurantSlug(restaurant) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const restaurant = getRestaurantBySlug((await params).id);
  if (!restaurant) return {};
  const name = restaurantName(restaurant);
  const purpose = gatheringPurposeLabel(restaurant);
  return {
    title: `${name} · ${purpose} 장소`,
    description: `${restaurant.district} ${name}의 가격대, 룸, 코스, 주차, 휴무일과 ${purpose} 관련 외부 후기를 확인하세요.`,
  };
}

function courseLabel(value: "yes" | "no" | "unknown"): string {
  if (value === "yes") return "가능";
  if (value === "no") return "없음";
  return "확인 필요";
}

function uniqueEvidence(records: RestaurantEvidenceRecord[]): RestaurantEvidenceRecord[] {
  const seen = new Set<string>();
  return records.filter((record) => {
    const key = record.duplicateGroup ?? record.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sponsorshipLabel(value: RestaurantEvidenceRecord["sponsored"]): string {
  if (value === "yes") return "광고·협찬";
  if (value === "no") return "비협찬 표기";
  return "협찬 여부 확인 필요";
}

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const restaurant = getRestaurantBySlug((await params).id);
  if (!restaurant) notFound();

  const evidence = getRestaurantEvidence(restaurant);
  const reviews = uniqueEvidence(evidence.filter(isVisitReviewEvidence))
    .sort((left, right) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? ""));
  const references = uniqueEvidence(evidence.filter((record) => !isVisitReviewEvidence(record))).slice(0, 6);
  const purpose = gatheringPurposeLabel(restaurant);
  const gatheringHref = `/gatherings/?purpose=${restaurant.purpose}`;
  const location = [restaurant.district, restaurant.area].filter(Boolean).join(" · ");

  return (
    <article className="detail-page restaurant-detail-page">
      <nav className="breadcrumb" aria-label="현재 위치">
        <Link href={gatheringHref}>{purpose} 장소 찾기</Link>
        <span>›</span>
        <span>{restaurant.district}</span>
      </nav>

      <header className="detail-header restaurant-detail-header">
        <div>
          <p className="eyebrow">{purpose}</p>
          <h1>{restaurantName(restaurant)}</h1>
          <p>{location} · {restaurantStationLabel(restaurant)}</p>
          <div className="chip-row">
            {restaurant.venueType ? <span className="chip restaurant-venue-type">업종 · {restaurant.venueType}</span> : null}
            {restaurant.cuisines.map((cuisine) => <span className="chip" key={cuisine}>{cuisine}</span>)}
            {restaurant.captionTags.slice(0, 5).map((tag) => <span className="chip" key={tag}>#{tag}</span>)}
          </div>
        </div>
        <div className="restaurant-detail-actions">
          {restaurant.naverMapUrl ? <a href={restaurant.naverMapUrl} target="_blank" rel="noreferrer">네이버 지도</a> : null}
          {restaurant.kakaoMapUrl ? <a href={restaurant.kakaoMapUrl} target="_blank" rel="noreferrer">카카오맵</a> : null}
        </div>
      </header>

      <dl className="fact-grid restaurant-detail-facts">
        <div><dt>1인 가격</dt><dd>{restaurantPriceLabel(restaurant)}</dd></div>
        <div><dt>룸 인원</dt><dd>{restaurantRoomLabel(restaurant)}</dd></div>
        <div><dt>코스</dt><dd>{courseLabel(restaurant.courseAvailable)}</dd></div>
        <div><dt>주차</dt><dd>{restaurantParkingLabel(restaurant)}</dd></div>
      </dl>

      {restaurant.recommendationPoints ? (
        <section className="restaurant-detail-highlight" aria-labelledby="restaurant-recommendation">
          <p className="eyebrow">WHY HERE</p>
          <h2 id="restaurant-recommendation">이 장소를 살펴볼 이유</h2>
          <p>{restaurant.recommendationPoints}</p>
        </section>
      ) : null}

      <section className="detail-section">
        <h2>방문 조건</h2>
        <div className="quiet-table">
          <div><span>주소</span><strong>{restaurant.address ?? "확인 필요"}</strong></div>
          <div><span>가까운 역</span><strong>{restaurantStationLabel(restaurant)}</strong></div>
          <div><span>정기 휴무</span><strong>{restaurantClosedDaysLabel(restaurant)}</strong></div>
          <div><span>점심 최소 금액</span><strong>{restaurant.lunchPriceMin !== null ? `${restaurant.lunchPriceMin.toLocaleString("ko-KR")}원` : "확인 필요"}</strong></div>
          <div><span>저녁 최소 금액</span><strong>{restaurant.dinnerPriceMin !== null ? `${restaurant.dinnerPriceMin.toLocaleString("ko-KR")}원` : "확인 필요"}</strong></div>
          <div><span>주차 안내</span><strong>{restaurant.parkingDetail ?? restaurantParkingLabel(restaurant)}</strong></div>
        </div>
      </section>

      <section className="detail-section restaurant-review-section" aria-labelledby="restaurant-reviews">
        <div className="restaurant-section-heading">
          <div>
            <p className="eyebrow">EVIDENCE</p>
            <h2 id="restaurant-reviews">외부 방문 후기</h2>
          </div>
          <span>{reviews.length}개 연결</span>
        </div>
        <p className="restaurant-section-description">블로그·카페·지도 후기 중 이 음식점과 연결된 외부 기록입니다. 원문과 작성 시점을 함께 확인해 주세요.</p>
        {reviews.length > 0 ? (
          <div className="restaurant-review-list">
            {reviews.map((review) => (
              <article className="restaurant-review-card" key={review.id}>
                <div className="restaurant-review-meta">
                  <span>{review.platform ?? review.sourceType}</span>
                  {review.publishedAt ? <time dateTime={review.publishedAt}>{review.publishedAt}</time> : <span>작성일 미상</span>}
                  <span className={`sponsorship-label is-${review.sponsored}`}>{sponsorshipLabel(review.sponsored)}</span>
                </div>
                <h3>{review.title ?? `${restaurantName(restaurant)} 방문 후기`}</h3>
                {review.summary ? <p>{review.summary}</p> : null}
                {review.companionTypes.length > 0 ? (
                  <div className="restaurant-review-companions">
                    {review.companionTypes.map((companion) => <span key={companion}>{companion}</span>)}
                  </div>
                ) : null}
                <a href={review.url} target="_blank" rel="noreferrer">후기 원문 보기</a>
              </article>
            ))}
          </div>
        ) : (
          <div className="restaurant-review-empty">
            <strong>아직 연결된 방문 후기가 없어요.</strong>
            <p>Evidence 탭에 블로그나 후기 링크가 추가되면 다음 데이터 반영 때 이곳에 표시됩니다.</p>
          </div>
        )}
      </section>

      <section className="detail-section">
        <h2>정보 출처</h2>
        <p className="source-summary">최근 확인 {restaurant.verifiedAt ?? "확인 필요"} · 연결된 Evidence {evidence.length}개 · 음식점 집계 출처 {restaurant.sourceCount}개</p>
        {restaurant.officialEvidence ? <p>{restaurant.officialEvidence}</p> : null}
        {references.length > 0 ? (
          <div className="source-links">
            {references.map((reference) => (
              <a href={reference.url} target="_blank" rel="noreferrer" key={reference.id}>
                {reference.title ?? reference.platform ?? "확인 자료 보기"}
              </a>
            ))}
          </div>
        ) : null}
      </section>

      <p className="data-notice">가격, 룸, 주차와 휴무 정보는 운영 상황에 따라 달라질 수 있습니다. 예약 전 음식점에 다시 확인해 주세요.</p>
    </article>
  );
}
