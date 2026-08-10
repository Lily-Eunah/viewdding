"use client";

import { useEffect, useState } from "react";
import { HallCard } from "@/components/HallCard";
import type { FilteredHall } from "@/domain/types";
import { FAVORITES_EVENT, readFavorites, writeFavorites } from "@/lib/favorites";
import { fetchFavoriteHalls } from "@/lib/search-api";

export function FavoritesClient() {
  const [ids, setIds] = useState<string[]>([]);
  const [saved, setSaved] = useState<FilteredHall[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sync = () => setIds(readFavorites());
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(FAVORITES_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  useEffect(() => {
    if (ids.length === 0) { setSaved([]); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    fetchFavoriteHalls(ids, controller.signal).then((response) => setSaved(response.halls)).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [ids]);
  if (loading) return <div className="empty-state"><p>저장한 웨딩홀을 불러오고 있어요.</p></div>;
  if (saved.length === 0) return <div className="empty-state"><h2>아직 저장한 홀이 없어요.</h2><p>조건에 맞는 홀을 찾아 후보를 저장해보세요.</p><a className="primary-link" href="/search/">웨딩홀 찾아보기</a></div>;
  return <><div className="favorites-summary"><p>저장한 홀 {saved.length}개</p><button type="button" onClick={() => { if (window.confirm("저장한 홀을 모두 삭제할까요?")) writeFavorites([]); }}>전체 삭제</button></div><p className="device-note">현재 브라우저에만 저장되며 기기를 바꾸면 목록이 유지되지 않을 수 있어요.</p><div className="result-list">{saved.map((item) => <HallCard key={item.hall.id} hall={item.hall} />)}</div></>;
}
