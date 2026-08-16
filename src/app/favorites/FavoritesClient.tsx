"use client";

import { useEffect, useMemo, useState } from "react";
import { HallCard } from "@/components/HallCard";
import { RestaurantCard } from "@/components/RestaurantCard";
import { PersonalColorCard } from "@/components/PersonalColorCard";
import { CurationCard } from "@/components/CurationCard";
import { halls } from "@/lib/data";
import { restaurants } from "@/lib/restaurants";
import { personalColors } from "@/lib/personal-colors";
import essentialsData from "@/data/wedding-essentials.json";
import {
  clearCategory,
  FAVORITES_EVENT,
  readAllFavorites,
  toggleFavorite,
  type FavoriteCategory,
  type FavoritesData,
} from "@/lib/favorites";
import type { WeddingEssentialItem } from "@/domain/essentials-types";

const ALL_ESSENTIALS = essentialsData as WeddingEssentialItem[];

const TABS: Array<{ key: FavoriteCategory; label: string; href: string }> = [
  { key: "halls", label: "웨딩홀", href: "/search/" },
  { key: "invitation", label: "청첩장 모임", href: "/gatherings/?purpose=invitation" },
  { key: "family_meeting", label: "상견례", href: "/gatherings/?purpose=family_meeting" },
  { key: "essentials", label: "결혼 준비물", href: "/essentials/" },
  { key: "wedding_color", label: "퍼스널 컬러", href: "/wedding-color/" },
];

export function FavoritesClient() {
  const [favoritesData, setFavoritesData] = useState<FavoritesData>({
    halls: [],
    restaurants: { invitation: [], family_meeting: [] },
    wedding_color: [],
    essentials: [],
  });
  const [activeTab, setActiveTab] = useState<FavoriteCategory>("halls");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") as FavoriteCategory | null;
    if (tabParam && TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  useEffect(() => {
    const sync = () => setFavoritesData(readAllFavorites());
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function switchTab(tab: FavoriteCategory) {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  const savedHalls = useMemo(
    () => favoritesData.halls.map((id) => halls.find((h) => h.id === id)).filter((h): h is NonNullable<typeof h> => Boolean(h)),
    [favoritesData.halls],
  );

  const savedInvitationRestaurants = useMemo(
    () =>
      favoritesData.restaurants.invitation
        .map((id) => restaurants.find((r) => r.id === id))
        .filter((r): r is NonNullable<typeof r> => Boolean(r)),
    [favoritesData.restaurants.invitation],
  );

  const savedFamilyMeetingRestaurants = useMemo(
    () =>
      favoritesData.restaurants.family_meeting
        .map((id) => restaurants.find((r) => r.id === id))
        .filter((r): r is NonNullable<typeof r> => Boolean(r)),
    [favoritesData.restaurants.family_meeting],
  );

  const savedEssentials = useMemo(
    () =>
      (favoritesData.essentials || [])
        .map((id: string) => ALL_ESSENTIALS.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => Boolean(e)),
    [favoritesData.essentials],
  );

  const savedWeddingColors = useMemo(
    () =>
      (favoritesData.wedding_color || [])
        .map((id: string) => personalColors.find((v) => v.id === id))
        .filter((v): v is NonNullable<typeof v> => Boolean(v)),
    [favoritesData.wedding_color],
  );

  const currentTabInfo = TABS.find((t) => t.key === activeTab)!;

  const currentCount =
    activeTab === "halls"
      ? savedHalls.length
      : activeTab === "invitation"
      ? savedInvitationRestaurants.length
      : activeTab === "family_meeting"
      ? savedFamilyMeetingRestaurants.length
      : activeTab === "essentials"
      ? savedEssentials.length
      : savedWeddingColors.length;

  return (
    <section className="favorites-client-section">
      <nav className="main-nav-tabs favorites-tabs" role="tablist" aria-label="즐겨찾기 카테고리">
        {TABS.map((tab) => {
          const count =
            tab.key === "halls"
              ? savedHalls.length
              : tab.key === "invitation"
              ? savedInvitationRestaurants.length
              : tab.key === "family_meeting"
              ? savedFamilyMeetingRestaurants.length
              : tab.key === "essentials"
              ? savedEssentials.length
              : savedWeddingColors.length;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`main-tab-btn${activeTab === tab.key ? " is-active" : ""}`}
              onClick={() => switchTab(tab.key)}
            >
              {tab.label} {count > 0 ? `(${count})` : ""}
            </button>
          );
        })}
      </nav>

      {currentCount > 0 ? (
        <div className="favorites-summary">
          <p>
            저장한 {currentTabInfo.label} {currentCount}개
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`저장한 ${currentTabInfo.label} 목록을 모두 삭제할까요?`)) {
                clearCategory(activeTab);
              }
            }}
          >
            {currentTabInfo.label} 전체 삭제
          </button>
        </div>
      ) : null}

      <p className="device-note">현재 브라우저에만 저장되며 기기를 바꾸면 목록이 유지되지 않을 수 있어요.</p>

      {activeTab === "halls" ? (
        savedHalls.length > 0 ? (
          <div className="result-list">
            {savedHalls.map((hall) => (
              <HallCard key={hall.id} hall={hall} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>아직 저장한 웨딩홀이 없어요.</h2>
            <p>조건에 맞는 웨딩홀을 찾아 후보를 저장해보세요.</p>
            <a className="primary-link" href={currentTabInfo.href}>
              웨딩홀 찾아보기
            </a>
          </div>
        )
      ) : activeTab === "invitation" ? (
        savedInvitationRestaurants.length > 0 ? (
          <div className="restaurant-result-list">
            {savedInvitationRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>아직 저장한 청첩장 모임 장소가 없어요.</h2>
            <p>분위기와 위치가 좋은 모임 장소를 찾아 후보를 저장해보세요.</p>
            <a className="primary-link" href={currentTabInfo.href}>
              청첩장 모임 장소 찾아보기
            </a>
          </div>
        )
      ) : activeTab === "family_meeting" ? (
        savedFamilyMeetingRestaurants.length > 0 ? (
          <div className="restaurant-result-list">
            {savedFamilyMeetingRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>아직 저장한 상견례 장소가 없어요.</h2>
            <p>룸과 코스 요리가 구비된 정갈한 상견례 장소를 찾아 후보를 저장해보세요.</p>
            <a className="primary-link" href={currentTabInfo.href}>
              상견례 장소 찾아보기
            </a>
          </div>
        )
      ) : activeTab === "essentials" ? (
        savedEssentials.length > 0 ? (
          <div className="essentials-grid" style={{ marginTop: "24px" }}>
            {savedEssentials.map((item) => (
              <CurationCard
                key={item.id}
                id={item.id}
                name={item.name}
                brand={item.brand}
                priceText={item.priceText}
                thumbnailUrl={item.thumbnailUrl}
                affiliateUrl={item.affiliateUrl}
                platform={item.platform}
                editorNote={item.editorNote}
                tips={item.tips}
                tags={item.tags}
                isAffiliate={item.isAffiliate}
                isMustHave={item.isMustHave}
                isSaved={true}
                onToggleSave={() => toggleFavorite("essentials", item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>아직 저장한 준비물이 없어요.</h2>
            <p>본식과 스냅 촬영 전 필요한 준비물을 찾아 보관함에 담아보세요.</p>
            <a className="primary-link" href={currentTabInfo.href}>
              결혼 준비물 둘러보기
            </a>
          </div>
        )
      ) : savedWeddingColors.length > 0 ? (
        <div className="restaurant-result-list">
          {savedWeddingColors.map((vendor) => (
            <PersonalColorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>아직 저장한 퍼스널 컬러 업체가 없어요.</h2>
          <p>드레스와 메이크업 전 나에게 맞는 웨딩 컬러진단 업체를 찾아 저장해보세요.</p>
          <a className="primary-link" href={currentTabInfo.href}>
            퍼스널 컬러 업체 찾아보기
          </a>
        </div>
      )}
    </section>
  );
}
