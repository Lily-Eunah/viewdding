import Link from "next/link";
import type { FilteredHall, HallRecord } from "@/domain/types";
import { ceremonyLabel, hallTags, mealLabels, rangeLabel } from "@/lib/labels";
import { FavoriteButton } from "./FavoriteButton";

function hasRange(range: HallRecord["capacity"]): boolean {
  return range.min !== null && range.max !== null;
}

function attendanceLabel(hall: HallRecord): string | null {
  const seated = hasRange(hall.seated) ? `착석 ${rangeLabel(hall.seated)}` : null;
  const capacity = hasRange(hall.capacity) ? `최대 ${rangeLabel(hall.capacity)}` : null;
  return [seated, capacity].filter(Boolean).join(" · ") || null;
}

function mealLabel(hall: HallRecord): string | null {
  if (hall.meals.length > 0) return mealLabels(hall.meals);
  const raw = hall.raw.mealType?.trim();
  return raw ? raw.replace("/운영 문의", " · 운영 문의") : null;
}

function checkedAtLabel(value: string | null): string | null {
  return value ? `${value.replaceAll("-", ".")} 확인` : null;
}

export function HallCard({ hall }: { hall: HallRecord; unknownReasons?: FilteredHall["unknownReasons"] }) {
  const facts = [
    { label: "인원", value: attendanceLabel(hall) },
    { label: "예식", value: hall.ceremonyFormat === "unknown" ? null : ceremonyLabel(hall.ceremonyFormat) },
    { label: "식사", value: mealLabel(hall) },
  ].filter((fact): fact is { label: string; value: string } => fact.value !== null);
  const checkedAt = checkedAtLabel(hall.detailCheckedAt ?? hall.classificationCheckedAt);

  return (
    <article className={`hall-card${facts.length === 0 ? " is-sparse" : ""}`}>
      <div className="hall-card-main">
        <div className="hall-card-heading">
          <div>
            <p className="hall-venue-line"><span>{hall.venueName}</span><span className="hall-venue-divider" aria-hidden="true" /><span>{hall.district}</span></p>
            <h3><Link href={`/halls/${hall.id}/`}>{hall.hallName}</Link></h3>
          </div>
          <FavoriteButton hallId={hall.id} compact />
        </div>
        <div className="chip-row">{hallTags(hall).map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div>
      </div>
      {facts.length > 0 ? <dl className={`hall-facts count-${facts.length}`}>{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl> : null}
      <footer className="hall-card-footer">{checkedAt ? <span>{checkedAt}</span> : <span /> }<Link href={`/halls/${hall.id}/`}>상세 보기 <span aria-hidden="true">→</span></Link></footer>
    </article>
  );
}
