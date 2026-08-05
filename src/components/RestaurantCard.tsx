import type { RestaurantRecord, Weekday } from "@/domain/restaurant-types";

const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "월", tue: "화", wed: "수", thu: "목", fri: "금", sat: "토", sun: "일",
};

const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;

function priceLabel(restaurant: RestaurantRecord): string {
  const { min, max } = restaurant.pricePerPerson;
  if (min !== null && max !== null) return min === max ? won(min) : `${won(min)}~${won(max)}`;
  if (min !== null) return `${won(min)}부터`;
  if (max !== null) return `${won(max)}까지`;
  return "확인 필요";
}

function roomLabel(restaurant: RestaurantRecord): string {
  if (restaurant.privateRoom === "no") return "룸 없음";
  const { min, max } = restaurant.roomCapacity;
  if (min !== null && max !== null) return min === max ? `${min}명` : `${min}~${max}명`;
  if (min !== null) return `${min}명 이상`;
  if (max !== null) return `${max}명까지`;
  return restaurant.privateRoom === "yes" ? "룸 있음 · 인원 확인 필요" : "확인 필요";
}

function parkingLabel(restaurant: RestaurantRecord): string {
  if (restaurant.parking === "valet") return "발렛";
  if (restaurant.parking === "available") return "가능";
  if (restaurant.parking === "none") return "불가";
  return "확인 필요";
}

function closedDaysLabel(restaurant: RestaurantRecord): string {
  if (restaurant.closedWeekdays === null) return restaurant.regularClosedDaysRaw ?? "확인 필요";
  if (restaurant.closedWeekdays.length === 0) return "정기 휴무 없음";
  return `${restaurant.closedWeekdays.map((day) => WEEKDAY_LABELS[day]).join("·")} 휴무`;
}

export function RestaurantCard({ restaurant, unknownReasons = [] }: { restaurant: RestaurantRecord; unknownReasons?: string[] }) {
  const station = restaurant.nearestStation
    ? `${restaurant.nearestStation}${restaurant.walkingMinutes !== null ? ` 도보 ${restaurant.walkingMinutes}분` : ""}`
    : "가까운 역 확인 필요";
  return (
    <article className="restaurant-card">
      <div>
        <div className="restaurant-card-heading">
          <div><p className="eyebrow">{restaurant.purpose === "invitation" ? "청첩장 모임" : "상견례"}</p><h3>{restaurant.name}{restaurant.branch ? ` ${restaurant.branch}` : ""}</h3></div>
          <span className="purpose-badge">{restaurant.district}</span>
        </div>
        <p className="hall-location">{restaurant.area ?? restaurant.district} · {station}</p>
        {restaurant.recommendationPoints ? <p className="restaurant-point">{restaurant.recommendationPoints}</p> : null}
        <div className="chip-row">
          {restaurant.cuisines.map((cuisine) => <span className="chip" key={cuisine}>{cuisine}</span>)}
          {restaurant.venueType ? <span className="chip">{restaurant.venueType}</span> : null}
          {restaurant.captionTags.slice(0, 4).map((tag) => <span className="chip" key={tag}>#{tag}</span>)}
        </div>
        {unknownReasons.length > 0 ? <p className="unknown-reason">확인 필요: {unknownReasons.join(" · ")}</p> : null}
      </div>
      <div>
        <dl className="restaurant-metrics">
          <div><dt>1인 가격</dt><dd>{priceLabel(restaurant)}</dd></div>
          <div><dt>룸 인원</dt><dd>{roomLabel(restaurant)}</dd></div>
          <div><dt>코스</dt><dd>{restaurant.courseAvailable === "yes" ? "가능" : restaurant.courseAvailable === "no" ? "없음" : "확인 필요"}</dd></div>
          <div><dt>주차</dt><dd>{parkingLabel(restaurant)}</dd></div>
          <div><dt>정기 휴무</dt><dd>{closedDaysLabel(restaurant)}</dd></div>
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
