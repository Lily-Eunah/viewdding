import personalColorsData from "@/data/personal-colors.generated.json";
import type { PersonalColorRecord, PersonalColorStatus, VerificationGrade } from "@/domain/personal-color-types";

let personalColorPhotosData: Record<string, { photoUrl?: string | null }> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  personalColorPhotosData = require("@/data/personal-color-photos.generated.json");
} catch {
  personalColorPhotosData = {};
}

export const personalColors: PersonalColorRecord[] = (personalColorsData as unknown as PersonalColorRecord[]).map(
  (vendor) => ({
    ...vendor,
    photoUrl: personalColorPhotosData[vendor.id]?.photoUrl ?? vendor.photoUrl ?? null,
  })
);

export function getActivePersonalColors(): PersonalColorRecord[] {
  return personalColors.filter((vendor) => vendor.active);
}

export function getPersonalColorById(id: string): PersonalColorRecord | undefined {
  return personalColors.find((vendor) => vendor.id === id);
}

export function formatPersonalColorPrice(vendor: PersonalColorRecord): string {
  if (vendor.priceEstimatedMin) {
    const minMan = Math.round(vendor.priceEstimatedMin / 10000);
    if (vendor.priceEstimatedMax && vendor.priceEstimatedMax !== vendor.priceEstimatedMin) {
      const maxMan = Math.round(vendor.priceEstimatedMax / 10000);
      return `${minMan}~${maxMan}만원`;
    }
    return `약 ${minMan}만원`;
  }

  if (!vendor.priceRaw) return "문의";

  // Try extracting number pairs from raw strings (e.g. "168,000원", "273,000원", "15만원")
  const manMatches = Array.from(vendor.priceRaw.matchAll(/(\d+(?:\.\d+)?)\s*만\s*원?/g)).map((m) => Number(m[1]));
  const fullNumMatches = Array.from(vendor.priceRaw.matchAll(/(\d{2,3}),(\d{3})\s*원?/g)).map((m) =>
    Math.round(Number(m[1] + m[2]) / 10000)
  );

  const allNums = [...manMatches, ...fullNumMatches].filter((n) => n >= 3 && n <= 100);
  if (allNums.length > 0) {
    const min = Math.min(...allNums);
    const max = Math.max(...allNums);
    if (min === max) return `약 ${min}만원`;
    return `${min}~${max}만원`;
  }

  if (vendor.priceRaw.length <= 10 && !vendor.priceRaw.includes("·")) {
    return vendor.priceRaw;
  }

  return "문의";
}

export function personalColorStatusBadge(status: PersonalColorStatus): { label: string; tone: "primary" | "warning" | "neutral" } {
  switch (status) {
    case "recommended":
      return { label: "게재 권장", tone: "primary" };
    case "verify_booking":
      return { label: "예약 확인", tone: "warning" };
    case "on_hold":
      return { label: "보류", tone: "neutral" };
  }
}

export function personalColorGradeBadge(grade: VerificationGrade): { label: string; tone: "badge-a" | "badge-b" | "badge-c" } {
  switch (grade) {
    case "A":
      return { label: "A등급 검증", tone: "badge-a" };
    case "B":
      return { label: "B등급", tone: "badge-b" };
    case "C":
      return { label: "C등급", tone: "badge-c" };
  }
}
