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
        <span>
          {photo.sourceType === "public_listing"
            ? "\uacf5\uac1c \uc815\ubcf4 \uc0ac\uc9c4"
            : photo.photoKind === "wedding_setup"
              ? "\uacf5\uc2dd \uc608\uc2dd \uc138\ud305"
              : "\uacf5\uc2dd \uacf5\uac04 \uc804\uacbd"}
        </span>
        <span aria-hidden="true"> {"\u00b7"} </span>
        <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
          {photo.sourceName} <span aria-hidden="true">{"\u2197"}</span>
        </a>
      </figcaption>
    </figure>
  );
}
