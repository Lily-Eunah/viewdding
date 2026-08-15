"use client";

import type { HallRecord } from "@/domain/types";
import { shortSidoLabel } from "@/domain/regions";
import { ceremonyLabel, hallTags, mealLabels } from "@/lib/labels";

function escapeCSVField(val: string): string {
  const clean = String(val ?? "").replace(/"/g, '""');
  return `"${clean}"`;
}

export function generateCSVContent(halls: HallRecord[]): string {
  const headers = [
    "순번",
    "시/도",
    "시/군/구",
    "예식장명",
    "홀이름",
    "조명/분위기",
    "홀스타일",
    "최소보증인원",
    "착석인원",
    "최대수용인원",
    "예식시간",
    "예식형태",
    "식사형태",
    "주소",
  ];

  const rows = [headers];

  halls.forEach((hall, index) => {
    const styleTags = hallTags(hall).join(", ");
    const lightingStr =
      hall.lighting === "bright"
        ? "밝은홀"
        : hall.lighting === "dark"
        ? "어두운홀"
        : hall.lighting === "transitional"
        ? "조도전환홀"
        : "-";

    const guaranteeStr = hall.guarantee?.raw
      ? String(hall.guarantee.raw)
      : hall.guarantee?.min || hall.guarantee?.max
      ? `${hall.guarantee.min ?? 0}~${hall.guarantee.max ?? 0}명`
      : "-";

    const seatedStr = hall.seated?.raw
      ? String(hall.seated.raw)
      : hall.seated?.min || hall.seated?.max
      ? `${hall.seated.min ?? 0}~${hall.seated.max ?? 0}석`
      : "-";

    const capacityStr = hall.capacity?.raw
      ? String(hall.capacity.raw)
      : hall.capacity?.min || hall.capacity?.max
      ? `${hall.capacity.min ?? 0}~${hall.capacity.max ?? 0}명`
      : "-";

    const intervalStr = hall.interval?.raw
      ? String(hall.interval.raw)
      : hall.ceremonyTime || "-";

    const ceremonyStr = hall.ceremonyFormat !== "unknown" ? ceremonyLabel(hall.ceremonyFormat) : "-";
    const mealStr = hall.meals.length > 0 ? mealLabels(hall.meals) : "-";

    rows.push([
      String(index + 1),
      hall.sido || "-",
      hall.sigungu || hall.district || "-",
      hall.venueName || "-",
      hall.hallName || "-",
      lightingStr,
      styleTags || "-",
      guaranteeStr,
      seatedStr,
      capacityStr,
      intervalStr,
      ceremonyStr,
      mealStr,
      hall.address || hall.locationAddress || "-",
    ]);
  });

  const csvContent = rows
    .map((row) => row.map(escapeCSVField).join(","))
    .join("\r\n");

  // UTF-8 BOM byte sequence
  return "\uFEFF" + csvContent;
}

export function exportToExcel(halls: HallRecord[], filename: string) {
  if (halls.length === 0) {
    alert("내보낼 데이터가 없습니다.");
    return;
  }

  const csvWithBom = generateCSVContent(halls);
  const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

