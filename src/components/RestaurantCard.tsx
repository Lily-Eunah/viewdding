import Link from "next/link";
import type { RestaurantRecord } from "@/domain/restaurant-types";
import {
  gatheringPurposeLabel,
  restaurantClosedDaysLabel,
  restaurantParkingLabel,
  restaurantPriceLabel,
  restaurantRoomLabel,
  restaurantStationLabel,
} from "@/lib/restaurant-labels";
import { restaurantSlug } from "@/lib/restaurant-routes";

export function RestaurantCard({ restaurant, unknownReasons = [] }: { restaurant: RestaurantRecord; unknownReasons?: string[] }) {
  return (
    <article className="restaurant-card">
      <div>
        <div className="restaurant-card-heading">
          <div>
            <p className="eyebrow">{gatheringPurposeLabel(restaurant)}</p>
            <h3>
              <Link className="restaurant-card-primary-link" href={`/restaurants/${restaurantSlug(restaurant)}/`}>
                {restaurant.name}{restaurant.branch ? ` ${restaurant.branch}` : ""}
              </Link>
            </h3>
          </div>
          <span className="purpose-badge">{restaurant.district}</span>
        </div>
        <p className="hall-location">{restaurant.area ?? restaurant.district} · {restaurantStationLabel(restaurant)}</p>
        {restaurant.recommendationPoints ? <p className="restaurant-point">{restaurant.recommendationPoints}</p> : null}
        <div className="chip-row">
          {restaurant.venueType ? <span className="chip restaurant-venue-type">업종 · {restaurant.venueType}</span> : null}
          {restaurant.cuisines.map((cuisine) => <span className="chip" key={cuisine}>{cuisine}</span>)}
          {restaurant.captionTags.slice(0, 4).map((tag) => <span className="chip" key={tag}>#{tag}</span>)}
        </div>
        {unknownReasons.length > 0 ? <p className="unknown-reason">확인 필요: {unknownReasons.join(" · ")}</p> : null}
      </div>
      <div>
        <dl className="restaurant-metrics">
          <div><dt>1인 가격</dt><dd>{restaurantPriceLabel(restaurant)}</dd></div>
          <div><dt>룸 인원</dt><dd>{restaurantRoomLabel(restaurant)}</dd></div>
          <div><dt>코스</dt><dd>{restaurant.courseAvailable === "yes" ? "가능" : restaurant.courseAvailable === "no" ? "없음" : "확인 필요"}</dd></div>
          <div><dt>주차</dt><dd>{restaurantParkingLabel(restaurant)}</dd></div>
          <div><dt>정기 휴무</dt><dd>{restaurantClosedDaysLabel(restaurant)}</dd></div>
          <div><dt>최근 확인</dt><dd>{restaurant.verifiedAt ?? "확인 필요"}</dd></div>
        </dl>
        <div className="restaurant-links">
          {restaurant.naverMapUrl ? <a href={restaurant.naverMapUrl} target="_blank" rel="noreferrer">네이버 지도</a> : null}
          {restaurant.kakaoMapUrl ? <a href={restaurant.kakaoMapUrl} target="_blank" rel="noreferrer">카카오맵</a> : null}
        </div>
      </div>
    </article>
  );
}
