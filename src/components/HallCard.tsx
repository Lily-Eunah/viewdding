import Link from "next/link";
import type { FilteredHall, HallRecord } from "@/domain/types";
import { ceremonyLabel, hallTags, rangeLabel } from "@/lib/labels";
import { FavoriteButton } from "./FavoriteButton";

export function HallCard({ hall, unknownReasons = [] }: { hall: HallRecord; unknownReasons?: FilteredHall["unknownReasons"] }) {
  return (
    <article className="hall-card">
      <div className="hall-card-main">
        <div className="hall-card-heading">
          <div>
            <p className="eyebrow">{hall.venueName}</p>
            <h3><Link href={`/halls/${hall.id}/`}>{hall.hallName}</Link></h3>
          </div>
          <FavoriteButton hallId={hall.id} compact />
        </div>
        <p className="hall-location">{hall.district}{hall.neighborhood ? ` · ${hall.neighborhood}` : ""} · {hall.detailCheckedAt ?? hall.classificationCheckedAt ?? "확인일 미상"}</p>
        <div className="chip-row">{hallTags(hall).map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div>
        {unknownReasons.length > 0 ? <p className="unknown-reason">{unknownReasons.join(" · ")} 정보 확인 필요</p> : null}
      </div>
      <dl className="hall-metrics">
        <div><dt>최대 수용</dt><dd>{rangeLabel(hall.capacity)}</dd></div>
        <div><dt>예식 간격</dt><dd>{rangeLabel(hall.interval, "분")}</dd></div>
        <div><dt>최소 보증</dt><dd>{rangeLabel(hall.guarantee)}</dd></div>
        <div><dt>예식 형태</dt><dd>{ceremonyLabel(hall.ceremonyFormat)}</dd></div>
      </dl>
    </article>
  );
}
