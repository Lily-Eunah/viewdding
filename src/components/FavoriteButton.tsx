"use client";

import { useEffect, useState } from "react";
import { FAVORITES_EVENT, readFavorites, writeFavorites } from "@/lib/favorites";

export function FavoriteButton({ hallId, compact = false }: { hallId: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const sync = () => setSaved(readFavorites().includes(hallId));
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(FAVORITES_EVENT, sync); window.removeEventListener("storage", sync); };
  }, [hallId]);

  return (
    <button
      type="button"
      className={`favorite-button${saved ? " is-saved" : ""}${compact ? " is-compact" : ""}`}
      aria-pressed={saved}
      aria-label={saved ? "즐겨찾기 해제" : "즐겨찾기 저장"}
      onClick={() => {
        const current = readFavorites();
        writeFavorites(saved ? current.filter((id) => id !== hallId) : [...current, hallId]);
      }}
    >
      <span aria-hidden="true">{saved ? "♥" : "♡"}</span>{compact ? null : <span>{saved ? "저장됨" : "즐겨찾기"}</span>}
    </button>
  );
}
