export const FAVORITES_KEY_V1 = "viewdding:favorites:v1";
export const FAVORITES_KEY = "viewdding:favorites:v2";
export const FAVORITES_EVENT = "viewdding:favorites-changed";

export type FavoriteCategory = "halls" | "invitation" | "family_meeting" | "wedding_color";

export interface FavoritesData {
  halls: string[];
  restaurants: {
    invitation: string[];
    family_meeting: string[];
  };
  wedding_color: string[];
}

const EMPTY_FAVORITES: FavoritesData = {
  halls: [],
  restaurants: {
    invitation: [],
    family_meeting: [],
  },
  wedding_color: [],
};

export function readAllFavorites(): FavoritesData {
  if (typeof window === "undefined") return EMPTY_FAVORITES;
  try {
    const rawV2 = window.localStorage.getItem(FAVORITES_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      return {
        halls: Array.isArray(parsed?.halls) ? parsed.halls.filter((id: unknown): id is string => typeof id === "string") : [],
        restaurants: {
          invitation: Array.isArray(parsed?.restaurants?.invitation)
            ? parsed.restaurants.invitation.filter((id: unknown): id is string => typeof id === "string")
            : [],
          family_meeting: Array.isArray(parsed?.restaurants?.family_meeting)
            ? parsed.restaurants.family_meeting.filter((id: unknown): id is string => typeof id === "string")
            : [],
        },
        wedding_color: Array.isArray(parsed?.wedding_color)
          ? parsed.wedding_color.filter((id: unknown): id is string => typeof id === "string")
          : [],
      };
    }

    // Migration from v1
    const rawV1 = window.localStorage.getItem(FAVORITES_KEY_V1);
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1);
      const halls = Array.isArray(parsedV1) ? parsedV1.filter((id: unknown): id is string => typeof id === "string") : [];
      const migrated: FavoritesData = {
        halls,
        restaurants: { invitation: [], family_meeting: [] },
        wedding_color: [],
      };
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(migrated));
      return migrated;
    }

    return EMPTY_FAVORITES;
  } catch {
    return EMPTY_FAVORITES;
  }
}

export function writeAllFavorites(data: FavoritesData): void {
  if (typeof window === "undefined") return;
  const cleanData: FavoritesData = {
    halls: Array.from(new Set(data.halls)),
    restaurants: {
      invitation: Array.from(new Set(data.restaurants.invitation)),
      family_meeting: Array.from(new Set(data.restaurants.family_meeting)),
    },
    wedding_color: Array.from(new Set(data.wedding_color || [])),
  };
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(cleanData));
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
}

export function readCategoryFavorites(category: FavoriteCategory): string[] {
  const data = readAllFavorites();
  if (category === "halls") return data.halls;
  if (category === "wedding_color") return data.wedding_color ?? [];
  return data.restaurants[category] ?? [];
}

export function isFavorite(category: FavoriteCategory, id: string): boolean {
  return readCategoryFavorites(category).includes(id);
}

export function toggleFavorite(category: FavoriteCategory, id: string): boolean {
  const data = readAllFavorites();
  let nextSaved = false;
  if (category === "halls") {
    const exists = data.halls.includes(id);
    data.halls = exists ? data.halls.filter((item) => item !== id) : [...data.halls, id];
    nextSaved = !exists;
  } else if (category === "wedding_color") {
    const list = data.wedding_color ?? [];
    const exists = list.includes(id);
    data.wedding_color = exists ? list.filter((item) => item !== id) : [...list, id];
    nextSaved = !exists;
  } else {
    const list = data.restaurants[category] ?? [];
    const exists = list.includes(id);
    data.restaurants[category] = exists ? list.filter((item) => item !== id) : [...list, id];
    nextSaved = !exists;
  }
  writeAllFavorites(data);
  return nextSaved;
}

export function clearCategory(category: FavoriteCategory): void {
  const data = readAllFavorites();
  if (category === "halls") {
    data.halls = [];
  } else if (category === "wedding_color") {
    data.wedding_color = [];
  } else {
    data.restaurants[category] = [];
  }
  writeAllFavorites(data);
}

export function clearAllFavorites(): void {
  writeAllFavorites(EMPTY_FAVORITES);
}

export function totalFavoritesCount(): number {
  const data = readAllFavorites();
  return (
    data.halls.length +
    data.restaurants.invitation.length +
    data.restaurants.family_meeting.length +
    (data.wedding_color?.length ?? 0)
  );
}

// Backward compatibility helpers
export function readFavorites(): string[] {
  return readCategoryFavorites("halls");
}

export function writeFavorites(ids: string[]): void {
  const data = readAllFavorites();
  data.halls = ids;
  writeAllFavorites(data);
}
