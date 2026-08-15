import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isBlogReviewEvidence, type RestaurantEvidenceRecord } from "@/domain/restaurant-evidence";
import {
  gatheringPurposeLabel,
  restaurantClosedDaysLabel,
  restaurantCompanionVisitLabel,
  restaurantMealMinimumLabel,
  restaurantName,
  restaurantParkingLabel,
  restaurantPriceLabel,
  restaurantRoomLabel,
  restaurantStationLabel,
} from "@/lib/restaurant-labels";
import { restaurantSlug } from "@/lib/restaurant-routes";
import { getRestaurantBySlug, getRestaurantEvidence, restaurants } from "@/lib/restaurants";
import {
  RestaurantDetailOutboundLink,
  RestaurantDetailTracker,
} from "@/components/RestaurantDetailTracker";

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

function uniqueEvidence(records: RestaurantEvidenceRecord[]): RestaurantEvidenceRecord[] {
  const seen = new Set<string>();
  return records.filter((record) => {
    const key = record.duplicateGroup ?? record.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sponsorshipLabel(value: Exclude<RestaurantEvidenceRecord["sponsored"], "unknown">): string {
  if (value === "yes") return "광고·협찬";
  return "비협찬 표기";
}

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const restaurant = getRestaurantBySlug((await params).id);
  if (!restaurant) notFound();

  const evidence = getRestaurantEvidence(restaurant);
  const reviews = uniqueEvidence(evidence.filter(isBlogReviewEvidence))
    .sort((left, right) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? ""));
  const purpose = gatheringPurposeLabel(restaurant);
  const gatheringHref = `/gatherings/?purpose=${restaurant.purpose}`;
  const location = [restaurant.district, restaurant.area].filter(Boolean).join(" · ");
  const mealMinimum = restaurantMealMinimumLabel(restaurant);
  const recommendation = restaurant.recommendationPoints?.replace(/\s*\/\s*/g, " · ");
  const displayName = restaurantName(restaurant);
  const vId = restaurantSlug(restaurant);
  const facts = [
    { label: "1인 가격", value: restaurantPriceLabel(restaurant) },
    { label: "정기 휴무", value: restaurantClosedDaysLabel(restaurant) },
    { label: "주차", value: restaurantParkingLabel(restaurant) },
    ...(restaurant.privateRoom === "yes"
      ? [{ label: "룸 인원", value: restaurantRoomLabel(restaurant) }]
      : []),
    ...(restaurant.purpose === "family_meeting" && restaurant.courseAvailable === "yes"
      ? [{ label: "코스", value: "가능" }]
      : []),
  ];

  return (
    <article className="detail-page restaurant-detail-page">
      <RestaurantDetailTracker
        vendorId={vId}
        vendorName={displayName}
        region={restaurant.district}
      />

      <nav className="breadcrumb" aria-label="현재 위치">
        <Link href={gatheringHref}>{purpose} 장소 찾기</Link>
        <span>›</span>
        <span>{restaurant.district}</span>
      </nav>

      <header className="detail-header restaurant-detail-header">
        <div>
          <p className="eyebrow">{purpose}</p>
          <h1>{displayName}</h1>
          <p>{location} · {restaurantStationLabel(restaurant)}</p>
          <div className="chip-row">
            {restaurant.venueType ? <span className="chip restaurant-venue-type">업종 · {restaurant.venueType}</span> : null}
            {restaurant.cuisines.map((cuisine) => <span className="chip" key={cuisine}>{cuisine}</span>)}
            {restaurant.captionTags.slice(0, 5).map((tag) => <span className="chip" key={tag}>#{tag}</span>)}
          </div>
        </div>
        <div className="restaurant-detail-actions">
          {restaurant.naverMapUrl ? (
            <RestaurantDetailOutboundLink
              vendorId={vId}
              vendorName={displayName}
              targetType="naver_map"
              targetUrl={restaurant.naverMapUrl}
              region={restaurant.district}
            >
              네이버 지도
            </RestaurantDetailOutboundLink>
          ) : null}
          {restaurant.kakaoMapUrl ? (
            <RestaurantDetailOutboundLink
              vendorId={vId}
              vendorName={displayName}
              targetType="kakao_map"
              targetUrl={restaurant.kakaoMapUrl}
              region={restaurant.district}
            >
              카카오맵
            </RestaurantDetailOutboundLink>
          ) : null}
        </div>
      </header>

      <dl className="fact-grid restaurant-detail-facts">
        {facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
      </dl>

      {recommendation ? (
        <section className="restaurant-detail-highlight" aria-labelledby="restaurant-recommendation">
          <p className="eyebrow">RECOMMENDED FOR</p>
          <h2 id="restaurant-recommendation">이런 모임에 추천해요</h2>
          <p>{recommendation}</p>
        </section>
      ) : null}

      <section className="detail-section">
        <h2>이용 정보</h2>
        <div className="quiet-table">
          {mealMinimum ? <div><span>시간대별 최소 금액</span><strong>{mealMinimum}</strong></div> : null}
          <div><span>주차 안내</span><strong>{restaurant.parkingDetail ?? restaurantParkingLabel(restaurant)}</strong></div>
        </div>
      </section>

      <section className="detail-section restaurant-review-section" aria-labelledby="restaurant-reviews">
        <div className="restaurant-section-heading">
          <div>
            <p className="eyebrow">BLOG REVIEWS</p>
            <h2 id="restaurant-reviews">{purpose} 후기</h2>
          </div>
        </div>
        <p className="restaurant-section-description">이 음식점의 {purpose} 경험을 담은 외부 블로그 후기입니다. 자세한 내용은 원문에서 확인해 주세요.</p>
        {reviews.length > 0 ? (
          <div className="restaurant-review-list">
            {reviews.map((review) => (
              <article className="restaurant-review-card" key={review.id}>
                <RestaurantDetailOutboundLink
                  vendorId={vId}
                  vendorName={displayName}
                  targetType="blog_review"
                  targetUrl={review.url}
                  region={restaurant.district}
                  className="restaurant-review-card-link"
                >
                  <div className="restaurant-review-meta">
                    <span>{review.platform ?? review.sourceType}</span>
                    {review.publishedAt ? <time dateTime={review.publishedAt}>{review.publishedAt}</time> : null}
                    {review.sponsored !== "unknown" ? (
                      <span className={`sponsorship-label is-${review.sponsored}`}>{sponsorshipLabel(review.sponsored)}</span>
                    ) : null}
                    {review.companionTypes.map((companion) => (
                      <span className="restaurant-companion-label" key={companion}>
                        {restaurantCompanionVisitLabel(companion)}
                      </span>
                    ))}
                  </div>
                  <h3>{review.title ?? "블로그 후기"}</h3>
                  {review.summary ? <p>{review.summary}</p> : null}
                </RestaurantDetailOutboundLink>
              </article>
            ))}
          </div>
        ) : (
          <div className="restaurant-review-empty">
            <strong>아직 연결된 블로그 후기가 없어요.</strong>
            <p>후기가 확인되면 이곳에 추가할게요.</p>
          </div>
        )}
      </section>

      <p className="data-notice">
        {restaurant.verifiedAt ? `정보 확인 ${restaurant.verifiedAt} · ` : ""}
        가격, 룸, 주차와 휴무 정보는 운영 상황에 따라 달라질 수 있습니다. 예약 전 음식점에 다시 확인해 주세요.
      </p>
    </article>
  );
}
