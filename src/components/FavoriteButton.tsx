"use client";

import { useEffect, useState } from "react";
import { FAVORITES_EVENT, isFavorite, toggleFavorite, type FavoriteCategory } from "@/lib/favorites";

export function FavoriteButton({
  itemId,
  hallId,
  category = "halls",
  compact = false,
}: {
  itemId?: string;
  hallId?: string;
  category?: FavoriteCategory;
  compact?: boolean;
}) {
  const targetId = itemId || hallId || "";
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!targetId) return;
    const sync = () => setSaved(isFavorite(category, targetId));
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [category, targetId]);

  if (!targetId) return null;

  return (
    <button
      type="button"
      className={`favorite-button${saved ? " is-saved" : ""}${compact ? " is-compact" : ""}`}
      aria-pressed={saved}
      aria-label={saved ? "즐겨찾기 해제" : "즐겨찾기 저장"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(category, targetId);
      }}
    >
      <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
    </button>
  );
}

