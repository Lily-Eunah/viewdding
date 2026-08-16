"use client";

import { useEffect, useState } from "react";
import { FAVORITES_EVENT, isFavorite, toggleFavorite, type FavoriteCategory } from "@/lib/favorites";
import { trackFavoriteToggle } from "@/lib/analytics-client";

export function FavoriteButton({
  itemId,
  hallId,
  category = "halls",
  compact = false,
  variant = "icon",
}: {
  itemId?: string;
  hallId?: string;
  category?: FavoriteCategory;
  compact?: boolean;
  variant?: "icon" | "chip";
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(category, targetId);
    trackFavoriteToggle({
      vendorId: targetId,
      category,
      isFavorite: !saved,
    });
  };

  if (variant === "chip") {
    return (
      <button
        type="button"
        className={`chip favorite-chip-btn${saved ? " is-saved" : ""}`}
        aria-pressed={saved}
        aria-label={saved ? "즐겨찾기 해제" : "즐겨찾기 저장"}
        onClick={handleClick}
      >
        <span aria-hidden="true" className="favorite-chip-heart" style={{ color: saved ? "#E11D48" : "inherit" }}>
          {saved ? "♥" : "♡"}
        </span>
        <span>{saved ? "저장됨" : "저장"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`favorite-button${saved ? " is-saved" : ""}${compact ? " is-compact" : ""}`}
      aria-pressed={saved}
      aria-label={saved ? "즐겨찾기 해제" : "즐겨찾기 저장"}
      onClick={handleClick}
    >
      <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
    </button>
  );
}
