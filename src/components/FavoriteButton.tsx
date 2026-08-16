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
  variant?: "icon" | "chip" | "portal";
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

  if (variant === "portal") {
    return (
      <button
        type="button"
        className={`portal-icon-only-btn favorite-portal-btn${saved ? " is-saved" : ""}`}
        aria-pressed={saved}
        aria-label={saved ? "즐겨찾기 해제" : "즐겨찾기 저장"}
        onClick={handleClick}
        title={saved ? "보관함에서 제거" : "보관함에 저장"}
      >
        <span
          aria-hidden="true"
          style={{
            fontSize: "16px",
            color: saved ? "#E11D48" : "#8A7E72",
            lineHeight: 1,
            transition: "color 0.15s ease",
          }}
        >
          {saved ? "♥" : "♡"}
        </span>
      </button>
    );
  }

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
