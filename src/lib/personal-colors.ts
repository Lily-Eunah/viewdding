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
      return `${minMan}~${maxMan}만원대`;
    }
    return `약 ${minMan}만원`;
  }
  return vendor.priceRaw || "문의";
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
