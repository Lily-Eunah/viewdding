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
    </figure>
  );
}
