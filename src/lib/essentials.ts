import fs from "node:fs/promises";
import path from "node:path";
import initialEssentials from "@/data/wedding-essentials.json";
import type { WeddingEssentialItem } from "@/domain/essentials-types";

const dataFilePath = path.join(process.cwd(), "src", "data", "wedding-essentials.json");

export async function getWeddingEssentials(): Promise<WeddingEssentialItem[]> {
  try {
    const raw = await fs.readFile(dataFilePath, "utf-8");
    const items = JSON.parse(raw) as WeddingEssentialItem[];
    return items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  } catch {
    return (initialEssentials as WeddingEssentialItem[]).sort(
      (a, b) => (a.order ?? 999) - (b.order ?? 999)
    );
  }
}

export async function saveWeddingEssentials(items: WeddingEssentialItem[]): Promise<boolean> {
  try {
    const sorted = items.map((item, idx) => ({ ...item, order: idx + 1 }));
    await fs.writeFile(dataFilePath, JSON.stringify(sorted, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to save wedding essentials:", error);
    return false;
  }
}
