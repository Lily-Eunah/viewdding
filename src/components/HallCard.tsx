import Link from "next/link";
import type { FilteredHall, HallRecord } from "@/domain/types";
import { shortSidoLabel } from "@/domain/regions";
import { ceremonyLabel, hallTags, mealLabels } from "@/lib/labels";
import { FavoriteButton } from "./FavoriteButton";
import { HallPhotoMedia } from "./HallPhotoMedia";

function hasRange(range: HallRecord["capacity"]): boolean {
  return range.min !== null || range.max !== null;
}

function attendanceLabel(hall: HallRecord): string | null {
  const parts: string[] = [];
  if (hasRange(hall.seated)) {
    const val = hall.seated.max ?? hall.seated.min;
    if (val !== null) {
      parts.push(`착석 ${val.toLocaleString()}명`);
    }
  }
  if (hasRange(hall.capacity)) {
    const val = hall.capacity.max ?? hall.capacity.min;
    if (val !== null) {
      parts.push(`최대 ${val.toLocaleString()}명`);
    }
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

function ceremonyFormatLabel(hall: HallRecord): string | null {
  if (hall.ceremonyFormat === "unknown") return null;
  const label = ceremonyLabel(hall.ceremonyFormat);
  const interval = hall.interval?.min ?? hall.interval?.max;
  if (interval) return `${label} (${interval}분)`;
  return label;
}

function mealTypeLabel(hall: HallRecord): string | null {
  if (hall.meals.length > 0) return mealLabels(hall.meals);
  const raw = hall.raw.mealType?.trim();
  return raw ? raw.replace("/운영 문의", " · 운영 문의") : null;
}

export function HallCard({ hall }: { hall: HallRecord; unknownReasons?: FilteredHall["unknownReasons"] }) {
  const locationText = `${shortSidoLabel(hall.sido)} ${hall.sigungu || hall.district}`;
  const displayName = hall.hallName && hall.hallName !== hall.venueName
    ? `${hall.venueName}_${hall.hallName}`
    : hall.venueName;

  const attendance = attendanceLabel(hall);
  const ceremony = ceremonyFormatLabel(hall);
  const meal = mealTypeLabel(hall);
  const tags = hallTags(hall);
  const primaryPhoto = hall.photos?.[0];

  return (
    <article className="hall-card">
      <Link href={`/halls/${hall.id}/`} className="hall-card-main-link" style={{ display: "block", color: "inherit", textDecoration: "none" }}>
        <div className="hall-card-media-wrapper">
          {primaryPhoto ? (
            <HallPhotoMedia photo={primaryPhoto} variant="card" />
          ) : (
            <div className="hall-photo-placeholder" style={{ padding: 0, overflow: "hidden" }}>
              <img
                src="/viewdding-home-clean-v63.png"
                alt={displayName}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
              />
            </div>
          )}
        </div>

        <div className="hall-card-body">
          <div className="hall-card-location">{locationText}</div>
          <h3 className="hall-card-title">{displayName}</h3>

          {tags.length > 0 ? (
            <div className="chip-row">
              {tags.map((tag) => (
                <span className="chip" key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}

          <div className="hall-card-details">
            {attendance ? (
              <div className="hall-detail-line">
                <span className="detail-label">인원</span>
                <span className="detail-value">{attendance}</span>
              </div>
            ) : null}
            {ceremony ? (
              <div className="hall-detail-line">
                <span className="detail-label">예식</span>
                <span className="detail-value">{ceremony}</span>
              </div>
            ) : null}
            {meal ? (
              <div className="hall-detail-line">
                <span className="detail-label">식사</span>
                <span className="detail-value">{meal}</span>
              </div>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="favorite-button-overlay">
        <FavoriteButton itemId={hall.id} category="halls" compact />
      </div>
    </article>
  );
}
