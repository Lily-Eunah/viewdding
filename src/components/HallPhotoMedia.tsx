"use client";

import { useState } from "react";
import type { HallPhoto } from "@/domain/types";

export function HallPhotoMedia({ photo, variant }: { photo: HallPhoto; variant: "card" | "detail" }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <figure className={`hall-photo hall-photo-${variant}`}>
      <img
        src={photo.url}
        alt={photo.alt}
        loading={variant === "card" ? "lazy" : "eager"}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
      <figcaption>
        <span>{photo.photoKind === "wedding_setup" ? "공식 예식 세팅" : "공식 공간 전경"}</span>
        <span aria-hidden="true"> · </span>
        <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
          {photo.sourceName} <span aria-hidden="true">↗</span>
        </a>
      </figcaption>
    </figure>
  );
}
